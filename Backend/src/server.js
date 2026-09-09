import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import app from './app.js';
import connectDB, { disconnectDB } from './config/db.js';
import { validateEnv } from './config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from Backend/.env or environment
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

// Validate critical environment variables in production
validateEnv();

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Database Connection
connectDB().catch((err) => {
  if (NODE_ENV === 'production') {
    console.error('[KisanSetu Backend] Critical failure initializing database in production:', err.message);
    process.exit(1);
  }
});

const server = app.listen(PORT, () => {
  console.log(`[KisanSetu Backend] Server running in ${NODE_ENV} mode on port ${PORT}`);
  console.log(`[KisanSetu Backend] Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown handler
const gracefulShutdown = (signal) => {
  console.log(`\n[KisanSetu Backend] Received ${signal}. Initiating graceful shutdown...`);
  server.close(async () => {
    console.log('[KisanSetu Backend] HTTP server closed.');
    try {
      await disconnectDB();
      console.log('[KisanSetu Backend] Database connection closed gracefully.');
      process.exit(0);
    } catch (err) {
      console.error('[KisanSetu Backend] Error during database disconnect:', err.message);
      process.exit(1);
    }
  });

  // Force shutdown after 10s if graceful termination hangs
  setTimeout(() => {
    console.error('[KisanSetu Backend] Shutdown timed out. Forcing process exit.');
    process.exit(1);
  }, 10000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[KisanSetu Backend] Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error(`[KisanSetu Backend] Uncaught Exception: ${err.message}`);
  server.close(() => process.exit(1));
});

export default server;
