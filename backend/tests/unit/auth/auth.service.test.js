const bcrypt = require('bcryptjs');
const authService = require('../auth.service');
const { prisma } = require('../../../config/database');
const { ValidationError } = require('../../../utils/errors');
const { createTestUser } = require('../../../../tests/helpers');

describe('AuthService', () => {
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('register', () => {
    const validUserData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123!'
    };

    it('should create a new user successfully', async () => {
      const user = await authService.register(validUserData);

      expect(user).toBeDefined();
      expect(user.email).toBe(validUserData.email);
      expect(user.username).toBe(validUserData.username);
      expect(user.passwordHash).toBeDefined();
      expect(user.role).toBe('USER');
    });

    it('should throw error if email already exists', async () => {
      await authService.register(validUserData);

      await expect(
        authService.register(validUserData)
      ).rejects.toThrow('Email already exists');
    });

    it('should hash the password', async () => {
      const user = await authService.register(validUserData);
      const isPasswordValid = await bcrypt.compare(
        validUserData.password,
        user.passwordHash
      );

      expect(isPasswordValid).toBe(true);
    });
  });

  describe('login', () => {
    const userData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123!'
    };

    beforeEach(async () => {
      await authService.register(userData);
    });

    it('should login successfully with correct credentials', async () => {
      const result = await authService.login({
        email: userData.email,
        password: userData.password
      });

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(userData.email);
    });

    it('should throw error with incorrect password', async () => {
      await expect(
        authService.login({
          email: userData.email,
          password: 'wrongpassword'
        })
      ).rejects.toThrow('Invalid credentials');
    });

    it('should throw error with non-existent email', async () => {
      await expect(
        authService.login({
          email: 'nonexistent@example.com',
          password: userData.password
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });
}); 