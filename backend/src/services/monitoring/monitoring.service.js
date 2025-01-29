const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');

class MonitoringService {
  constructor() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTime: [],
      lastReset: new Date(),
      slowRequests: 0
    };
    this.metricsInterval = null;
    this.initialize();
  }

  initialize() {
    this.metricsInterval = setInterval(() => this.resetMetrics(), 3600000);
  }

  close() {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  resetMetrics() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTime: [],
      lastReset: new Date(),
      slowRequests: 0
    };
  }

  async trackError(error, context = {}) {
    try {
      this.metrics.errorCount++;

      // Log to console first
      logger.error('Error tracked:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        context
      });

      // Try to log to database if available
      try {
        await prisma.errorLog.create({
          data: {
            message: error.message || 'Unknown error',
            stack: error.stack,
            code: error.code,
            context: context,
            severity: context.severity || 'error'
          }
        });
      } catch (dbError) {
        // If database logging fails, just log to console
        logger.warn('Database error logging failed:', dbError);
      }

      // Alert if error threshold exceeded
      if (this.metrics.errorCount > 100) { // Configurable threshold
        await this.sendAlert({
          type: 'ERROR_THRESHOLD',
          message: 'High error rate detected',
          metrics: this.metrics
        });
      }
    } catch (trackingError) {
      logger.error('Error tracking failed:', trackingError);
    }
  }

  async trackPerformance(route, duration) {
    try {
      this.metrics.requestCount++;
      
      if (duration > 1000) { // 1 second threshold
        this.metrics.slowRequests++;
        
        try {
          await prisma.performanceLog.create({
            data: {
              route,
              duration,
              timestamp: new Date()
            }
          });
        } catch (dbError) {
          logger.warn('Performance logging to database failed:', dbError);
        }

        // Alert if performance threshold exceeded
        if (this.metrics.slowRequests > 50) { // Configurable threshold
          await this.sendAlert({
            type: 'PERFORMANCE',
            message: 'High number of slow requests detected',
            metrics: this.metrics
          });
        }
      }
    } catch (error) {
      logger.error('Performance tracking failed:', error);
    }
  }

  async sendAlert(alert) {
    try {
      // Log alert to console first
      logger.warn('System alert:', alert);

      // Try to save to database if available
      try {
        await prisma.alert.create({
          data: {
            type: alert.type,
            message: alert.message,
            data: alert.metrics
          }
        });
      } catch (dbError) {
        logger.warn('Alert logging to database failed:', dbError);
      }
    } catch (error) {
      logger.error('Alert sending failed:', error);
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    };
  }
}

// Create singleton instance
const monitoringService = new MonitoringService();

// Add cleanup for tests
if (process.env.NODE_ENV === 'test') {
  afterAll(() => {
    monitoringService.close();
  });
}

module.exports = monitoringService; 