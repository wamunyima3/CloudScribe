const WebSocket = require('ws');
const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');
const templates = require('./templates');
const cacheService = require('../cache/cache.service');

class NotificationService {
  constructor() {
    this.connections = new Map();
    this.initializeWebSocket();
  }

  initializeWebSocket() {
    this.wss = new WebSocket.Server({ noServer: true });

    this.wss.on('connection', (ws, userId) => {
      this.connections.set(userId, ws);
      logger.info(`WebSocket connected for user: ${userId}`);

      ws.on('close', () => {
        this.connections.delete(userId);
        logger.info(`WebSocket disconnected for user: ${userId}`);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
      });
    });
  }

  async create(userId, type, data) {
    try {
      if (!templates[type]) {
        throw new Error(`Notification template '${type}' not found`);
      }

      const template = templates[type](data);
      
      // Create notification in database
      const notification = await prisma.notification.create({
        data: {
          userId,
          type,
          title: template.title,
          body: template.body,
          icon: template.icon,
          link: template.link,
          metadata: data
        }
      });

      // Send real-time notification if user is connected
      this.sendToUser(userId, {
        type: 'NOTIFICATION',
        data: notification
      });

      // Invalidate notifications cache
      await cacheService.clear(`notifications:${userId}:*`);

      return notification;
    } catch (error) {
      logger.error('Create notification error:', error);
      throw error;
    }
  }

  async getUnread(userId) {
    try {
      const cacheKey = `notifications:${userId}:unread`;
      
      let notifications = await cacheService.get(cacheKey);
      
      if (!notifications) {
        notifications = await prisma.notification.findMany({
          where: {
            userId,
            read: false
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        await cacheService.set(cacheKey, notifications, 300); // 5 minutes cache
      }

      return notifications;
    } catch (error) {
      logger.error('Get unread notifications error:', error);
      throw error;
    }
  }

  async markAsRead(userId, notificationId) {
    try {
      await prisma.notification.update({
        where: {
          id: notificationId,
          userId // Ensure notification belongs to user
        },
        data: {
          read: true,
          readAt: new Date()
        }
      });

      // Invalidate cache
      await cacheService.clear(`notifications:${userId}:*`);

      return true;
    } catch (error) {
      logger.error('Mark notification as read error:', error);
      throw error;
    }
  }

  async updatePreferences(userId, preferences) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          preferences: {
            ...preferences
          }
        }
      });

      return true;
    } catch (error) {
      logger.error('Update notification preferences error:', error);
      throw error;
    }
  }

  sendToUser(userId, message) {
    const connection = this.connections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  }

  broadcast(message, excludeUser = null) {
    this.wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN && client.userId !== excludeUser) {
        client.send(JSON.stringify(message));
      }
    });
  }

  // Attach WebSocket server to HTTP server
  handleUpgrade(request, socket, head) {
    const userId = this.authenticateWebSocket(request);
    if (!userId) {
      socket.destroy();
      return;
    }

    this.wss.handleUpgrade(request, socket, head, (ws) => {
      ws.userId = userId;
      this.wss.emit('connection', ws, userId);
    });
  }

  authenticateWebSocket(request) {
    // Implement your WebSocket authentication logic here
    // Example: validate token from query parameters or headers
    const token = new URL(request.url, 'http://localhost').searchParams.get('token');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.userId;
    } catch (error) {
      logger.error('WebSocket authentication failed:', error);
      return null;
    }
  }
}

module.exports = new NotificationService(); 