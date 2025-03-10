const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('../../config/database');
const emailService = require('../../services/email/email.service');
const { ValidationError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

/**
 * Authentication Service
 * @class AuthService
 * @description Handles user authentication, registration, and token management
 */
class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
  }

  /**
   * Register a new user
   * @async
   * @param {Object} userData - User registration data
   * @param {string} userData.email - User's email
   * @param {string} userData.username - User's username
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} Created user object
   * @throws {ValidationError} If email or username already exists
   */
  async register(userData) {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    try {
      const user = await prisma.user.create({
        data: {
          email: userData.email,
          username: userData.username,
          passwordHash,
          role: 'USER',
          points: 0,
          streak: 0,
          lastLoginDate: new Date(),
          lastActive: new Date()
        }
      });

      return user;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ValidationError('Email already exists');
      }
      throw error;
    }
  }

  async verifyEmail(token) {
    const user = await prisma.user.findUnique({
      where: { verifyToken: token }
    });

    if (!user) {
      throw new ValidationError('Invalid verification token');
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verifyToken: null
      }
    });

    return true;
  }

  /**
   * Authenticate user and generate token
   * @async
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Authentication token and user data
   * @throws {ValidationError} If credentials are invalid
   */
  async login(credentials) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new ValidationError('Invalid credentials');
    }

    const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
    if (!isValid) {
      throw new ValidationError('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { user, token };
  }

  async requestPasswordReset(email) {
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return true even if user doesn't exist (security)
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExp = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExp
      }
    });

    await emailService.sendPasswordResetEmail(user, resetToken);
    return true;
  }

  async resetPassword(token, newPassword) {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExp: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExp: null
      }
    });

    return true;
  }

  async refreshToken(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    return this.generateToken(user.id);
  }
}

module.exports = new AuthService(); 