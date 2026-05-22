import { Server } from 'http';
import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, prisma } from './config/db.js';
import { logger } from './utils/logger.js';

let server: Server;

// Uncaught Exceptions handling
process.on('uncaughtException', (err: Error) => {
  logger.error('❌ UNCAUGHT EXCEPTION! Shutting down...');
  logger.error(err.name + ': ' + err.message);
  if (err.stack) logger.error(err.stack);
  process.exit(1);
});

async function startServer() {
  // Connect to PostgreSQL database
  await connectDB();

  // Start server
  server = app.listen(env.PORT, () => {
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    logger.info(`🔗 Health check available at: http://localhost:${env.PORT}/api/v1/health`);
  });

  // Handle Unhandled Rejections
  process.on('unhandledRejection', (err: any) => {
    logger.error('❌ UNHANDLED REJECTION! Shutting down...');
    logger.error(err?.name + ': ' + err?.message);
    if (server) {
      server.close(() => {
        prisma.$disconnect().then(() => {
          process.exit(1);
        });
      });
    } else {
      process.exit(1);
    }
  });
}

startServer();

// Graceful Shutdown on System Signals
const gracefulShutdown = (signal: string) => {
  logger.warn(`⚠️ ${signal} received. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      logger.info('🛑 HTTP server closed.');
      await prisma.$disconnect();
      logger.info('🔌 Database connection closed.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
