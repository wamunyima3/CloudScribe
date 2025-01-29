const Redis = require('ioredis');
const { logger } = require('../utils/logger');

const redis = new Redis(process.env.REDIS_URL, {
  keyPrefix: process.env.REDIS_PREFIX,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (error) => {
  logger.error('Redis connection error:', error);
});

redis.on('connect', () => {
  logger.info('Redis connected successfully');
});

// For testing purposes
if (process.env.NODE_ENV === 'test') {
  redis.disconnect = async () => {
    await redis.quit();
  };
}

module.exports = { redis }; 