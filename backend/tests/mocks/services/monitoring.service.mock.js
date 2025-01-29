const mockMonitoringService = {
  trackError: jest.fn(),
  trackPerformance: jest.fn(),
  getMetrics: jest.fn().mockReturnValue({
    requestCount: 0,
    errorCount: 0,
    responseTime: [],
    lastReset: new Date(),
    uptime: 0
  }),
  resetMetrics: jest.fn(),
  sendAlert: jest.fn(),
  close: jest.fn()
};

jest.mock('../../../src/services/monitoring/monitoring.service', () => mockMonitoringService);

module.exports = mockMonitoringService; 