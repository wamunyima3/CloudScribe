const { prisma } = require('../../config/database');
const cacheService = require('../cache/cache.service');
const { logger } = require('../../utils/logger');
const emailService = require('../email/email.service');

class HealthService {
  async checkDatabase() {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return {
        status: 'healthy',
        latency: 0, // You could measure query time here
        message: 'Database connection is healthy'
      };
    } catch (error) {
      logger.error('Database health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Database connection failed'
      };
    }
  }

  async checkRedis() {
    try {
      const start = Date.now();
      await cacheService.client.ping();
      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency,
        message: 'Redis connection is healthy'
      };
    } catch (error) {
      logger.error('Redis health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Redis connection failed'
      };
    }
  }

  async checkEmailService() {
    try {
      const isConnected = await emailService.transporter.verify();
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        message: isConnected ? 'Email service is healthy' : 'Email service is not responding'
      };
    } catch (error) {
      logger.error('Email service health check failed:', error);
      return {
        status: 'unhealthy',
        error: error.message,
        message: 'Email service check failed'
      };
    }
  }

  async checkMemory() {
    const used = process.memoryUsage();
    const memoryHealth = used.heapUsed < (used.heapTotal * 0.9); // 90% threshold

    return {
      status: memoryHealth ? 'healthy' : 'warning',
      metrics: {
        heapUsed: Math.round(used.heapUsed / 1024 / 1024),
        heapTotal: Math.round(used.heapTotal / 1024 / 1024),
        rss: Math.round(used.rss / 1024 / 1024),
        external: Math.round(used.external / 1024 / 1024)
      },
      message: memoryHealth ? 'Memory usage is normal' : 'High memory usage detected'
    };
  }

  async getFullHealth() {
    const [database, redis, email, memory] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkEmailService(),
      this.checkMemory()
    ]);

    const isHealthy = [database, redis, email].every(check => check.status === 'healthy');

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: {
        database,
        redis,
        email,
        memory
      },
      version: process.env.npm_package_version,
      uptime: process.uptime()
    };
  }
}

module.exports = new HealthService(); 