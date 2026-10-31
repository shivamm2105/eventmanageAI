import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import fs from 'fs';
import { config } from './config';
import eventsRouter from './routes/events';
import systemRouter from './routes/system';
import { errorHandler } from './middleware/errorHandler';

export function createApp(): express.Application {
  const app = express();

  // Enable Gzip/Deflate compression for fast network transfer
  app.use(compression());

  // Security Headers via Helmet
  app.use(
    helmet({
      contentSecurityPolicy: false, // Let Vite/frontend load Google Fonts and styles cleanly
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS Configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
        if (!origin) return callback(null, true);
        if (
          !config.isProduction ||
          config.clientOrigins.includes('*') ||
          config.clientOrigins.includes(origin) ||
          origin.endsWith('.vercel.app') ||
          origin.endsWith('.onrender.com') ||
          origin.endsWith('.railway.app') ||
          origin.includes('localhost')
        ) {
          return callback(null, true);
        }
        if (process.env.CLIENT_ORIGIN) {
          return callback(new Error(`CORS origin not allowed: ${origin}`));
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // JSON request body parser with bounded payload size
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // API Routes (Mounted under /api and root fallback for reverse proxies/serverless)
  app.use('/api', systemRouter);
  app.use('/api/events', eventsRouter);
  app.use('/', systemRouter);
  app.use('/events', eventsRouter);

  // Serve static assets from client/dist if built (for standalone node production server)
  const clientDistPath = path.resolve(process.cwd(), 'client', 'dist');
  if (fs.existsSync(clientDistPath)) {
    app.use(
      express.static(clientDistPath, {
        maxAge: '1d',
        setHeaders: (res, filePath) => {
          if (filePath.includes('assets')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          }
        },
      })
    );

    // Client-side SPA routing fallback
    app.use((req, res, next) => {
      if (req.path.startsWith('/api') || req.path.startsWith('/events') || req.path === '/health') {
        return next();
      }
      res.sendFile(path.join(clientDistPath, 'index.html'));
    });
  }

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
}
