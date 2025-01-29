class MockQueue {
  constructor() {
    this.add = jest.fn().mockResolvedValue({ id: 'mock-job-id' });
    this.process = jest.fn();
    this.on = jest.fn();
    this.close = jest.fn().mockResolvedValue(undefined);
    this.addToQueue = jest.fn().mockResolvedValue({ id: 'mock-job-id' });
  }
}

const mockQueue = new MockQueue();

module.exports = {
  Queue: jest.fn().mockImplementation(() => mockQueue),
  mockQueue // Export for direct access in tests
};

jest.mock('bull', () => module.exports); 