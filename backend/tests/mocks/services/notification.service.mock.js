const mockNotificationService = {
  create: jest.fn().mockImplementation(async (userId, type, data) => ({
    id: 'test-notification-id',
    userId,
    type,
    data,
    read: false,
    createdAt: new Date()
  })),
  getUnread: jest.fn().mockResolvedValue([]),
  markAsRead: jest.fn().mockResolvedValue(true),
  sendToUser: jest.fn(),
  handleUpgrade: jest.fn(),
  authenticateWebSocket: jest.fn().mockReturnValue('test-user-id'),
  close: jest.fn()
};

jest.mock('../../../src/services/notification/notification.service', () => mockNotificationService);

module.exports = mockNotificationService; 