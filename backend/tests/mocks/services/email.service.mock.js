const mockEmailService = {
  send: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  queue: jest.fn().mockResolvedValue({ id: 'test-job-id' }),
  sendWelcome: jest.fn().mockResolvedValue(true),
  sendPasswordReset: jest.fn().mockResolvedValue(true),
  sendVerificationEmail: jest.fn().mockResolvedValue(true),
  sendContributionApproved: jest.fn().mockResolvedValue(true),
  sendWeeklyDigest: jest.fn().mockResolvedValue(true),
  close: jest.fn().mockResolvedValue(undefined)
};

jest.mock('../../../src/services/email/email.service', () => mockEmailService);

module.exports = mockEmailService; 