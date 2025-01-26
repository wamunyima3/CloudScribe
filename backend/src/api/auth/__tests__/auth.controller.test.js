const request = require('supertest');
const createApp = require('../../../config/app');
const { createTestUser } = require('../../../../tests/helpers');

describe('AuthController', () => {
  let app;

  beforeAll(() => {
    app = createApp();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe(userData.email);
    });

    it('should return 400 with invalid data', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      const password = 'password123';
      const { user } = await createTestUser({ password });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveProperty('token');
    });
  });
}); 