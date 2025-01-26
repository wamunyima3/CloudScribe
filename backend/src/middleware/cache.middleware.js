const cacheService = require('../services/cache/cache.service');
const { logger } = require('../utils/logger');

class CacheMiddleware {
  static route(prefix, ttl = 3600) {
    return async (req, res, next) => {
      if (req.method !== 'GET') {
        return next();
      }

      try {
        const key = cacheService.generateKey(prefix, {
          path: req.path,
          query: req.query,
          user: req.user?.id // Include user context if needed
        });

        const cachedData = await cacheService.get(key);

        if (cachedData) {
          logger.debug('Cache hit:', key);
          return res.json(cachedData);
        }

        // Store original send function
        const originalSend = res.send;

        // Override send
        res.send = function (body) {
          try {
            const data = JSON.parse(body);
            cacheService.set(key, data, ttl)
              .catch(error => logger.error('Cache middleware set error:', error));
          } catch (error) {
            logger.error('Cache middleware parse error:', error);
          }

          // Restore original send
          res.send = originalSend;
          return res.send(body);
        };

        next();
      } catch (error) {
        logger.error('Cache middleware error:', error);
        next();
      }
    };
  }

  static bypass(req, res, next) {
    req.skipCache = true;
    next();
  }
}

module.exports = CacheMiddleware; 