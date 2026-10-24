import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AiServiceError } from '../services/aiService';
import { config } from '../config';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Zod schema validation errors
  if (err instanceof ZodError || err?.name === 'ZodError') {
    const issueList = err.issues || err.errors || [];
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input data provided.',
        details: issueList.map((e: any) => ({
          path: Array.isArray(e.path) ? e.path.join('.') : String(e.path || ''),
          message: e.message,
        })),
      },
    });
    return;
  }

  // AI service specific errors
  if (err instanceof AiServiceError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Catch-all generic errors
  console.error('Unhandled server error:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = config.isProduction
    ? 'An unexpected error occurred while processing your request.'
    : err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message,
    },
  });
}
