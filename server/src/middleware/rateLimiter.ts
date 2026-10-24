import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const aiRateLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxAiRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many event generation requests from this IP. Please try again later or use Demo Mode.',
    },
  },
});
