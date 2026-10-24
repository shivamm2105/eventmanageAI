import { createApp } from './app';
import { config } from './config';
import { getDatabase } from './db';

const app = createApp();

// Warm up database
try {
  getDatabase();
  console.log('✓ SQLite database connected');
} catch (err) {
  console.error('✗ Failed to initialize SQLite database:', err);
}

const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(` CelebrAI Server running on http://localhost:${config.port}`);
  console.log(` Environment: ${config.nodeEnv}`);
  console.log(` Gemini Model: ${config.geminiModel}`);
  console.log(` AI Configured: ${config.isAiConfigured ? 'YES (Live GenAI)' : 'NO (Demo Mode Active)'}`);
  console.log(`=======================================================`);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\nShutting down CelebrAI server gracefully...');
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\nReceived SIGTERM. Terminating...');
  server.close(() => {
    process.exit(0);
  });
});
