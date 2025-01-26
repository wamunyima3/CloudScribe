require('dotenv').config();
const createApp = require('./src/config/app');
const logger = require('./src/utils/logger');
const { connectDB, prisma } = require('./src/config/database');

const app = createApp();
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Test database connection
    await connectDB();
    logger.info('Database connected successfully');

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down server...');
      server.close(async () => {
        logger.info('Server closed');
        await prisma.$disconnect();
        logger.info('Database disconnected');
        process.exit(0);
      });

      // Force close after 10s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    logger.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  logger.error('Uncaught Exception:', error);
  await prisma.$disconnect();
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', async (error) => {
  logger.error('Unhandled Rejection:', error);
  await prisma.$disconnect();
  process.exit(1);
});

startServer();