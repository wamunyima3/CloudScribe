const cacheService = require('./cache.service');
const { logger } = require('../../utils/logger');

const strategies = {
  // Cache-aside strategy
  async getOrSet(key, fetchData, ttl = 3600) {
    try {
      let data = await cacheService.get(key);
      
      if (!data) {
        logger.debug('Cache miss:', key);
        data = await fetchData();
        if (data) {
          await cacheService.set(key, data, ttl);
        }
      } else {
        logger.debug('Cache hit:', key);
      }

      return data;
    } catch (error) {
      logger.error('Cache getOrSet error:', error);
      return fetchData();
    }
  },

  // Write-through strategy
  async writeThrough(key, data, ttl = 3600) {
    try {
      await cacheService.set(key, data, ttl);
      return data;
    } catch (error) {
      logger.error('Cache write-through error:', error);
      return data;
    }
  },

  // Cache invalidation patterns
  invalidation: {
    // Single key invalidation
    async single(key) {
      return cacheService.del(key);
    },

    // Pattern-based invalidation with safety checks
    async pattern(pattern) {
      if (!pattern || typeof pattern !== 'string') {
        logger.error('Invalid pattern provided for cache invalidation');
        return false;
      }

      // Prevent dangerous patterns
      if (pattern === '*' || pattern.startsWith('*')) {
        logger.error('Dangerous cache invalidation pattern detected:', pattern);
        return false;
      }

      return cacheService.clear(pattern);
    },

    // Entity-based invalidation
    async entity(entityType, entityId) {
      return cacheService.clear(`${entityType}:${entityId}:*`);
    },

    // Collection invalidation
    async collection(collectionName) {
      return cacheService.clear(`${collectionName}:*`);
    }
  }
};

module.exports = strategies; 