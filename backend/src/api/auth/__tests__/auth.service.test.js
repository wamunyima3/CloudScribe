const bcrypt = require('bcryptjs');
const AuthService = require('../auth.service');
const { prisma } = require('../../../config/database');
const { ValidationError } = require('../../../utils/errors');
const { createTestUser } = require('../../../../tests/helpers');

describe('AuthService', () => {
  describe('register', () => {
    it('should create a new user successfully', async () => {
      const userData = {
        email: 'new@example.com',
        username: 'newuser',
        password: 'password123'
      };

      const user = await AuthService.register(userData);

      expect(user).toHaveProperty('id');
      expect(user.email).toBe(userData.email);
      expect(user.username).toBe(userData.username);
    });

    it('should throw error if email already exists', async () => {
      const { user } = await createTestUser();

      await expect(AuthService.register({
        email: user.email,
        username: 'different',
        password: 'password123'
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', async () => {
      const password = 'password123';
      const { user } = await createTestUser({ password });

      const result = await AuthService.login({
        email: user.email,
        password
      });

      expect(result).toHaveProperty('token');
      expect(result.user.id).toBe(user.id);
    });

    it('should throw error with incorrect password', async () => {
      const { user } = await createTestUser();

      await expect(AuthService.login({
        email: user.email,
        password: 'wrongpassword'
      })).rejects.toThrow(ValidationError);
    });
  });
}); 