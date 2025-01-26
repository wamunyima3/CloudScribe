const prisma = require('../config/database');
const logger = require('../utils/logger');

class NotificationService {
  static async createNotification(userId, type, message, data = null) {
    try {
      return await prisma.notification.create({
        data: { userId, type, message, data }
      });
    } catch (error) {
      logger.error('Notification creation failed:', error);
      throw error;
    }
  }
}

module.exports = NotificationService; 