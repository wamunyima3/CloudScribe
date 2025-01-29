const mockRedis = () => {
  const redis = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    flushall: jest.fn(),
    quit: jest.fn()
  };
  
  return redis;
};

const mockLogger = () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn()
});

module.exports = {
  mockRedis,
  mockLogger
}; 