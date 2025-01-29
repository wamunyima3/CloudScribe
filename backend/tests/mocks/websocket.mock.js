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

  handleUpgrade(request, socket, head, callback) {
    callback(new MockWebSocket());
  }
};

module.exports = MockWebSocket; 