const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'minimal',
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');
    return prisma;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};

module.exports = { prisma, connectDB }; 