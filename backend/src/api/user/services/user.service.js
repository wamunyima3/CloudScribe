const bcrypt = require('bcryptjs');
const { prisma } = require('../../config/database');
const { NotFoundError, ValidationError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

class UserService {
  async getProfile(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          points: true,
          streak: true,
          lastActive: true,
          preferences: true,
          createdAt: true,
          _count: {
            select: {
              translations: true,
              stories: true,
              addedWords: true
            }
          }
        }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  async updateProfile(userId, updateData) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Handle password update
      if (updateData.currentPassword && updateData.newPassword) {
        const validPassword = await bcrypt.compare(
          updateData.currentPassword,
          user.passwordHash
        );

        if (!validPassword) {
          throw new ValidationError('Current password is incorrect');
        }

        updateData.passwordHash = await bcrypt.hash(updateData.newPassword, 10);
      }

      // Remove password fields from update data
      delete updateData.currentPassword;
      delete updateData.newPassword;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          preferences: true,
          lastActive: true
        }
      });

      return updatedUser;
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  async updatePreferences(userId, preferences) {
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { preferences },
        select: {
          id: true,
          preferences: true
        }
      });

      return updatedUser.preferences;
    } catch (error) {
      logger.error('Update preferences error:', error);
      throw error;
    }
  }

  async getActivityLog(userId) {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      });

      return logs;
    } catch (error) {
      logger.error('Get activity log error:', error);
      throw error;
    }
  }

  async getStats(userId) {
    try {
      const stats = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          points: true,
          streak: true,
          _count: {
            select: {
              translations: true,
              stories: true,
              addedWords: true,
              achievements: true
            }
          }
        }
      });

      if (!stats) {
        throw new NotFoundError('User not found');
      }

      return stats;
    } catch (error) {
      logger.error('Get stats error:', error);
      throw error;
    }
  }

  // Admin methods
  async searchUsers({ query, role, active, skip, limit, sortBy = 'createdAt', order = 'desc' }) {
    try {
      const where = {
        AND: [
          query && {
            OR: [
              { email: { contains: query } },
              { username: { contains: query } }
            ]
          },
          role && { role },
          typeof active === 'boolean' && {
            lastActive: active
              ? { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
              : { lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          }
        ].filter(Boolean)
      };

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            username: true,
            role: true,
            lastActive: true,
            createdAt: true,
            _count: {
              select: {
                translations: true,
                stories: true,
                addedWords: true
              }
            }
          },
          orderBy: { [sortBy]: order },
          skip,
          take: limit
        }),
        prisma.user.count({ where })
      ]);

      return { data: users, total };
    } catch (error) {
      logger.error('Search users error:', error);
      throw error;
    }
  }

  async createUser(userData) {
    try {
      const passwordHash = await bcrypt.hash(userData.password, 10);
      
      const user = await prisma.user.create({
        data: {
          ...userData,
          passwordHash,
          emailVerified: true // Admin-created users are pre-verified
        },
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          createdAt: true
        }
      });

      return user;
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  }

  async updateUser(userId, updateData) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          username: true,
          role: true,
          lastActive: true,
          updatedAt: true
        }
      });

      return user;
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      await prisma.user.delete({
        where: { id: userId }
      });

      return true;
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }
}

module.exports = new UserService(); 