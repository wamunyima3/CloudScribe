const monitoringService = require('../services/monitoring/monitoring.service');
const { logger } = require('../utils/logger');

class MonitoringMiddleware {
  static async trackRequest(req, res, next) {
    const start = Date.now();
    
    // Add response listener
    res.on('finish', () => {
      const duration = Date.now() - start;
      
      monitoringService.trackPerformance(req.path, duration);
      
      // Log request details
      logger.info('Request completed', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userId: req.user?.id
      });
    });

    next();
  }

  static async errorMonitoring(error, req, res, next) {
    await monitoringService.trackError(error, {
      path: req.path,
      method: req.method,
      userId: req.user?.id,
      ip: req.ip,
      severity: error.status >= 500 ? 'error' : 'warning'
    });

    next(error);
  }
}

module.exports = MonitoringMiddleware; 