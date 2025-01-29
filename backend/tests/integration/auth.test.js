const request = require('supertest');
const bcrypt = require('bcryptjs');
const app = require('../../src/app');
const { createTestUser, generateTestToken } = require('../helpers/auth.helper');
const { prisma } = require('../../src/config/database');
const { generateToken } = require('../../src/services/auth/auth.service');

describe('Auth Endpoints', () => {
  let testUser;

  beforeEach(async () => {
    // Create test user with known password
    const passwordHash = await bcrypt.hash('password123', 10);
    testUser = await createTestUser('USER', passwordHash);
  });

  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.success).toBe(true);
    });

    it('should reject invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return user profile with valid token', async () => {
      const token = generateTestToken(testUser);
      
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(testUser.email);
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          username: 'testuser'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should return error for duplicate email', async () => {
      const userData = {
        email: 'duplicate@example.com',
        username: 'testuser',
        password: 'Password123!'
      };

      // Create first user
      await request(app)
        .post('/api/auth/register')
        .send(userData);

      // Try to create duplicate
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully', async () => {
      // Create test user
      const user = await createTestUser({
        email: 'login@example.com',
        password: 'Password123!'
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: user.email,
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });
  });
}); 