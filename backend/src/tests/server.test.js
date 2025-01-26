const request = require('supertest');
const createApp = require('../config/app');

describe('Server Tests', () => {
  const app = createApp();

  it('should respond to health check', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  it('should handle 404 routes', async () => {
    const response = await request(app).get('/api/nonexistent');
    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
}); 