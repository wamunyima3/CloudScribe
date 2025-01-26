const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');

class RoleService {
  async assignRole(userId, role) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: { role }
      });

      logger.info(`Role assigned successfully`, {
        userId,
        role,
        assignedBy: req.user?.id
      });

      return user;
    } catch (error) {
      logger.error('Role assignment error:', error);
      throw error;
    }
  }

  async getUserPermissions(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get all permissions for the user's role
      return Object.entries(permissions)
        .filter(([_, roles]) => roles.includes(user.role))
        .map(([permission]) => permission);
    } catch (error) {
      logger.error('Get user permissions error:', error);
      throw error;
    }
  }

  async validatePermission(userId, permission) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      });

      if (!user || !permissions[permission]) {
        return false;
      }

      return permissions[permission].includes(user.role);
    } catch (error) {
      logger.error('Permission validation error:', error);
      throw error;
    }
  }
}

module.exports = new RoleService(); 