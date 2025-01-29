const NotificationService = require('../../../src/services/notification/notification.service');
const { prisma } = require('../../../src/config/database');
const { redis } = require('../../../src/config/redis');
const { createTestUser } = require('../../helpers/auth.helper');

// Mock WebSocket
jest.mock('ws', () => {
  class MockWebSocket {
    constructor() {
      this.clients = new Set();
      this.on = jest.fn();
      this.close = jest.fn();
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
jest.mock('../../../src/config/redis');

// Mock notification templates
jest.mock('../../../src/services/notification/notification.templates', () => ({
  WORD_APPROVED: (data) => ({
    title: 'Word Approved',
    message: 'Test notification',
    data
  })
}));

describe('NotificationService', () => {
  let testUser;
  let originalInterval;
  let notificationService;

  beforeAll(() => {
    originalInterval = global.setInterval;
    global.setInterval = jest.fn();
  });

  afterAll(() => {
    global.setInterval = originalInterval;
    // Clear all intervals
    jest.useRealTimers();
  });

  beforeEach(async () => {
    testUser = await createTestUser();
    notificationService = new NotificationService();
  });

  afterEach(() => {
    notificationService.close();
  });

  describe('create', () => {
    it('should create a notification for user', async () => {
      const notification = await NotificationService.create({
        userId: testUser.id,
        type: 'WORD_APPROVED',
        data: { wordId: '123' }
      });

      expect(notification).toBeDefined();
      expect(notification.userId).toBe(testUser.id);
      expect(notification.type).toBe('WORD_APPROVED');
    });

    it('should throw error for invalid template', async () => {
      await expect(
        NotificationService.create({
          userId: testUser.id,
          type: 'INVALID_TYPE',
          data: {}
        })
      ).rejects.toThrow('Notification template');
    });
  });

  describe('getUnread', () => {
    it('should return unread notifications from database', async () => {
      const notification = await NotificationService.create({
        userId: testUser.id,
        type: 'WORD_APPROVED',
        data: { wordId: '123' }
      });

      const unread = await NotificationService.getUnread(testUser.id);
      expect(unread).toHaveLength(1);
      expect(unread[0].id).toBe(notification.id);
    });
  });
}); 