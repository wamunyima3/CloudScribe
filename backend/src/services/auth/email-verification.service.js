const crypto = require('crypto');
const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');
const emailService = require('../email/email.service');

class EmailVerificationService {
  async sendVerificationEmail(userId) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || user.emailVerified) {
        return false;
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 24 * 3600000); // 24 hours

      await prisma.emailVerification.create({
        data: {
          userId,
          token,
          expires
        }
      });

      await emailService.sendVerificationEmail(user.email, token);
      return true;
    } catch (error) {
      logger.error('Send verification email error:', error);
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      const verification = await prisma.emailVerification.findFirst({
        where: {
          token,
          expires: { gt: new Date() },
          used: false
        },
        include: { user: true }
      });

      if (!verification) {
        throw new Error('Invalid or expired verification token');
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: verification.userId },
          data: { emailVerified: true }
        }),
        prisma.emailVerification.update({
          where: { id: verification.id },
          data: { used: true }
        })
      ]);

      return true;
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }
}

module.exports = new EmailVerificationService(); 