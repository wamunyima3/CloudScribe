const Redis = require('ioredis');
const { logger } = require('../../utils/logger');

class CacheService {
  constructor() {
    this.client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      }
    });

    this.client.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    this.client.on('connect', () => {
      logger.info('Redis connection established');
    });
  }

  async get(key) {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttl = 3600) {
    try {
      await this.client.set(
        key,
        JSON.stringify(value),
        'EX',
        ttl
      );
      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async clear(pattern) {
    try {
      const pipeline = this.client.pipeline();
      let cursor = '0';
      let totalKeys = 0;

      do {
        // Use SCAN instead of KEYS for better performance
        const [nextCursor, keys] = await this.client.scan(
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
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
    
    return `${prefix}:${JSON.stringify(sortedParams)}`;
  }
}

module.exports = new CacheService(); 