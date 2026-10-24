import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import eventsRouter from './routes/events';
import systemRouter from './routes/system';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();

  // Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Let Vite/frontend load Google Fonts and styles cleanly
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration restricted to configured origins
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (config.clientOrigins.includes(origin) || !config.isProduction) {
          return callback(null, true);
        }
        return callback(new Error(`CORS origin not allowed: ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // JSON request body parser with bounded payload size
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // API Routes
  app.use('/api', systemRouter);
  app.use('/api/events', eventsRouter);

  // Serve static assets from client/dist if built
  const clientDistPath = path.resolve(process.cwd(), 'client', 'dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));

    // Client-side SPA routing fallback
    app.use((req, res, next) => {
      if (req.path.startsWith('/api')) {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
