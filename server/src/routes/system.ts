import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { getDatabase } from '../db';
import { testGeminiApiKey } from '../services/aiService';
import { systemConfigRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  let dbHealthy = false;
  try {
    const db = getDatabase();
    const row = db.prepare('SELECT 1 as alive').get() as { alive: number };
    dbHealthy = row.alive === 1;
  } catch (err) {
    dbHealthy = false;
  }

  const statusCode = dbHealthy ? 200 : 503;

  res.status(statusCode).json({
    status: dbHealthy ? 'healthy' : 'degraded',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    services: {
      database: dbHealthy ? 'connected' : 'error',
      aiProvider: {
        provider: 'Google Gemini',
        configured: config.isAiConfigured,
        model: config.geminiModel,
      },
    },
  });
});

router.get('/system/status', (_req: Request, res: Response) => {
  res.json({
    appName: 'CelebrAI - Intelligent Event Planner',
    environment: config.nodeEnv,
    uptimeSeconds: Math.floor(process.uptime()),
    ai: {
      isConfigured: config.isAiConfigured,
      model: config.geminiModel,
      rateLimitMax: config.rateLimitMaxAiRequests,
      rateLimitWindowMinutes: Math.round(config.rateLimitWindowMs / 60000),
    },
    persistence: {
      engine: 'SQLite3 (WAL Mode)',
      localDatabase: true,
    },
  });
});

const configureAiSchema = z.object({
  apiKey: z.string().trim().min(8, { message: 'API key must be at least 8 characters' }),
  model: z.string().trim().optional(),
});

/**
 * POST /api/system/configure-ai
 * Allows live configuration and verification of a Gemini API Key without needing shell access.
 */
router.post(
  '/system/configure-ai',
  systemConfigRateLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = configureAiSchema.parse(req.body);
    const preferredModel = parsed.model || config.geminiModel || 'gemini-2.5-flash';

    // Verify key live with Google GenAI SDK
    const testResult = await testGeminiApiKey(parsed.apiKey, preferredModel);

    // Update in-memory configuration
    config.geminiApiKey = parsed.apiKey.trim();
    config.geminiModel = testResult.model;
    config.isAiConfigured = true;

    // Safely write/update .env file (which is gitignored) so key persists (skip during automated test runs)
    if (config.nodeEnv !== 'test') {
      try {
        const envPath = path.resolve(process.cwd(), '.env');
        let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf-8') : '';

        if (envContent.includes('GEMINI_API_KEY=')) {
          envContent = envContent.replace(/GEMINI_API_KEY=.*$/m, `GEMINI_API_KEY=${parsed.apiKey.trim()}`);
        } else {
          envContent += `\nGEMINI_API_KEY=${parsed.apiKey.trim()}`;
        }

        if (envContent.includes('GEMINI_MODEL=')) {
          envContent = envContent.replace(/GEMINI_MODEL=.*$/m, `GEMINI_MODEL=${testResult.model}`);
        } else {
          envContent += `\nGEMINI_MODEL=${testResult.model}`;
        }

        fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
      } catch (fsErr) {
        console.warn('Could not persist key to .env, key active in memory only:', fsErr);
      }
    }

    res.json({
      success: true,
      message: testResult.message,
      configured: true,
      model: testResult.model,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/system/disconnect-ai
 * Disconnects the live AI key and returns to Demo Mode.
 */
router.post('/system/disconnect-ai', (_req: Request, res: Response) => {
  config.geminiApiKey = '';
  config.isAiConfigured = false;

  if (config.nodeEnv !== 'test') {
    try {
      const envPath = path.resolve(process.cwd(), '.env');
      if (fs.existsSync(envPath)) {
        let envContent = fs.readFileSync(envPath, 'utf-8');
        envContent = envContent.replace(/GEMINI_API_KEY=.*$/m, 'GEMINI_API_KEY=');
        fs.writeFileSync(envPath, envContent, 'utf-8');
      }
    } catch (fsErr) {
      console.warn('Could not clear key in .env:', fsErr);
    }
  }

  res.json({
    success: true,
    message: 'Switched to Demo Mode. Real API calls are disabled.',
    configured: false,
  });
});

export default router;
