const Redis = require('ioredis');
const { logger } = require('../../utils/logger');

class CacheService {
  constructor() {
    this.redis = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => Math.min(times * 50, 2000)
    });

    this.redis.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });
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
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async clear(pattern) {
    try {
      const pipeline = this.redis.pipeline();
      let cursor = '0';
      let totalKeys = 0;

      do {
        // Use SCAN instead of KEYS for better performance
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100 // Process in smaller batches
        );
        
        cursor = nextCursor;
        
        if (keys.length > 0) {
          pipeline.del(...keys);
          totalKeys += keys.length;
        }

        // Execute pipeline when batch size reaches 1000 or on last iteration
        if (totalKeys >= 1000 || cursor === '0') {
          await pipeline.exec();
          totalKeys = 0;
        }
      } while (cursor !== '0');

      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  generateKey(prefix, params) {
    return `${prefix}:${JSON.stringify(params)}`;
  }
}

module.exports = new CacheService(); 