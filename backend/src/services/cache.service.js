const Redis = require('ioredis');
const logger = require('../utils/logger');

class CacheService {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL);
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      logger.error('Cache set error:', error);
    }
  }
}

module.exports = new CacheService(); 