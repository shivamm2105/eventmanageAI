import { Router, Request, Response } from 'express';
import { config } from '../config';
import { getDatabase } from '../db';

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

export default router;
