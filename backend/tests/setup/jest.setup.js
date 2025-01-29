// Load environment variables first
require('dotenv').config({ path: '.env.test' });

// Mock services before any imports
const mockServices = require('../mocks/services');

// Mock Bull queue
const mockQueue = {
  add: jest.fn().mockResolvedValue({ id: 'mock-job-id' }),
  process: jest.fn(),
  on: jest.fn(),
  close: jest.fn().mockResolvedValue(undefined),
  addToQueue: jest.fn().mockResolvedValue({ id: 'mock-job-id' })
};

jest.mock('bull', () => ({
  __esModule: true,
  default: jest.fn(() => mockQueue),
  Queue: jest.fn(() => mockQueue)
}));

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
    verify: jest.fn().mockResolvedValue(true),
    close: jest.fn()
  })
}));

// Mock WebSocket
jest.mock('ws', () => {
  class MockWebSocket {
    constructor() {
      this.clients = new Set();
      this.on = jest.fn();
      this.close = jest.fn();
      this.ping = jest.fn();
      this.terminate = jest.fn();
    }
  }

  MockWebSocket.Server = class MockServer {
    constructor() {
      this.clients = new Set();
      this.on = jest.fn();
      this.close = jest.fn();
    }
  };

  return MockWebSocket;
});

// Mock Redis
jest.mock('../../src/config/redis', () => ({
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined)
  }
}));

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'mysql://ekum:24673832@localhost:3306/cloudscribe_test';
process.env.REDIS_URL = 'redis://localhost:6379/1';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';

// Global test setup
beforeAll(() => {
  // Clear all mocks
  jest.clearAllMocks();
});

afterEach(async () => {
  // Clear database after each test
  await mockServices.clearDatabase();
});

afterAll(async () => {
  // Cleanup
  await mockServices.closeConnections();
}); 