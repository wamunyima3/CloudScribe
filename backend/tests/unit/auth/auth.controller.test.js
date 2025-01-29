const request = require('supertest');
const express = require('express');
const authController = require('../auth.controller');
const authService = require('../auth.service');
const { ApiResponse } = require('../../../utils/response');
const { prisma } = require('../../../config/database');
const { createTestUser } = require('../../../tests/helpers/auth.helper');

// Mock dependencies
jest.mock('../auth.service');
jest.mock('../../../utils/response');

// Mock express router
const mockRouter = express.Router();
mockRouter.get('/', (req, res) => res.json({ message: 'ok' }));

// Mock dictionary routes
jest.mock('../../dictionary/dictionary.routes', () => mockRouter);

describe('AuthController', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/auth', authController);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'Password123!',
        username: 'testuser'
      };

      authService.register.mockResolvedValue({
        id: 'test-id',
        email: userData.email,
        username: userData.username
      });

      const response = await request(app)
        .post('/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser('USER', 'password123');
    });

    it('should login successfully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
}); 