const cron = require('node-cron');
const { prisma } = require('../config/database');
const emailService = require('../services/email/email.service');
const { logger } = require('../utils/logger');

// Run every Sunday at 00:00
cron.schedule('0 0 * * 0', async () => {
  try {
    logger.info('Starting weekly digest job');

    const users = await prisma.user.findMany({
      where: {
        preferences: {
          path: ['notifications', 'email'],
          equals: true
        }
      },
      include: {
        _count: {
          select: {
            translations: true,
            stories: true,
            achievements: true
          }
        }
      }
    });

    for (const user of users) {
      const stats = await prisma.$transaction(async (prisma) => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const [contributions, pointsEarned, newAchievements] = await Promise.all([
          prisma.auditLog.count({
            where: {
              userId: user.id,
              createdAt: { gte: startDate }
            }
          }),
          prisma.user.findUnique({
            where: { id: user.id },
            select: { points: true }
          }),
          prisma.achievement.findMany({
            where: {
              userId: user.id,
              earnedAt: { gte: startDate }
            }
          })
        ]);

        return {
          startDate,
          contributions,
          pointsEarned: pointsEarned.points,
          streak: user.streak,
          newAchievements
        };
      });

      await emailService.sendWeeklyDigest(user, stats);
    }

    logger.info('Weekly digest job completed');
  } catch (error) {
    logger.error('Weekly digest job failed:', error);
  }
}); 