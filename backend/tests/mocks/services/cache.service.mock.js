const mockCacheService = {
  get: jest.fn(),
  set: jest.fn().mockResolvedValue(true),
  del: jest.fn().mockResolvedValue(true),
  clear: jest.fn().mockResolvedValue(true),
  clearPattern: jest.fn().mockResolvedValue(true)
};

jest.mock('../../../src/services/cache/cache.service', () => mockCacheService);

module.exports = mockCacheService; 