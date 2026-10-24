import dotenv from 'dotenv';
import path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Gemini AI Configuration
  geminiApiKey: process.env.GEMINI_API_KEY?.trim() || '',
  geminiModel: process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash',
  
  // Safe flag for client/health without exposing secret
  isAiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 5),

  // CORS Allowed Origins
  clientOrigins: (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://localhost:3001')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),

  // SQLite Database Path
  databasePath: process.env.DATABASE_PATH || './data/celebrai.db',

  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 mins
  rateLimitMaxAiRequests: parseInt(process.env.RATE_LIMIT_MAX_AI_REQUESTS || '25', 10),
};
