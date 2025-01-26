const crypto = require('crypto');
const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');
const emailService = require('../email/email.service');

class PasswordService {
  async initiateReset(email) {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        logger.info(`Password reset attempted for non-existent email: ${email}`);
        return true; // Don't reveal if email exists
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour

      await prisma.passwordReset.create({
        data: {
          userId: user.id,
          token,
          expires
        }
      });

      await emailService.sendPasswordReset(email, token);
      return true;
    } catch (error) {
      logger.error('Password reset initiation error:', error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const reset = await prisma.passwordReset.findFirst({
        where: {
          token,
          expires: { gt: new Date() },
          used: false
        },
        include: { user: true }
      });

      if (!reset) {
        throw new Error('Invalid or expired reset token');
      }

      await prisma.$transaction([
        prisma.user.update({
          where: { id: reset.userId },
          data: { password: await bcrypt.hash(newPassword, 10) }
        }),
        prisma.passwordReset.update({
          where: { id: reset.id },
          data: { used: true }
        })
      ]);

      return true;
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }
}

module.exports = new PasswordService(); 