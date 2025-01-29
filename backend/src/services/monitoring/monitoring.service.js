const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');

class MonitoringService {
  constructor() {
    this.metrics = {
      requestCount: 0,
      errorCount: 0,
      responseTime: [],
      lastReset: new Date()
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
      lastReset: new Date()
    };
  }

  async trackError(error, context = {}) {
    this.metrics.errorCount++;

    try {
      await prisma.errorLog.create({
        data: {
          message: error.message,
          stack: error.stack,
          code: error.code,
          context: context,
          severity: context.severity || 'error'
        }
      });

      // Alert if error threshold exceeded
      if (this.metrics.errorCount > 100) { // Configurable threshold
        await this.sendAlert({
          type: 'ERROR_THRESHOLD',
          message: 'High error rate detected',
          metrics: this.metrics
        });
      }
    } catch (logError) {
      logger.error('Error tracking failed:', logError);
    }
  }

  async trackPerformance(route, duration) {
    this.metrics.requestCount++;
    
    if (duration > 1000) { // 1 second threshold
      this.metrics.slowRequests++;
      
      await prisma.performanceLog.create({
        data: {
          route,
          duration,
          timestamp: new Date()
        }
      });

      // Alert if performance threshold exceeded
      if (this.metrics.slowRequests > 50) { // Configurable threshold
        await this.sendAlert({
          type: 'PERFORMANCE',
          message: 'High number of slow requests detected',
          metrics: this.metrics
        });
      }
    }
  }

  async sendAlert(alert) {
    try {
      await prisma.alert.create({
        data: {
          type: alert.type,
          message: alert.message,
          data: alert.metrics
        }
      });

      // You could integrate with external alerting services here
      // Example: Send to Slack, email, SMS, etc.
      logger.warn('System alert:', alert);
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