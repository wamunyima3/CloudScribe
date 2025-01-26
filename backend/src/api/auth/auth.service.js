const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { prisma } = require('../../config/database');
const emailService = require('../../services/email.service');
const { ValidationError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

class AuthService {
  generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '24h' });
  }

  async register(userData) {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    });

    if (existingUser) {
      throw new ValidationError('Email or username already exists');
    }

    const verifyToken = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        passwordHash,
        verifyToken
      }
    });

    await emailService.sendVerificationEmail(user, verifyToken);

    return {
      id: user.id,
      email: user.email,
      username: user.username
    };
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

  async login(credentials) {
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user || !(await bcrypt.compare(credentials.password, user.passwordHash))) {
      throw new ValidationError('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new ValidationError('Please verify your email first');
    }

    const token = this.generateToken(user.id);

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginDate: new Date() }
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    };
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