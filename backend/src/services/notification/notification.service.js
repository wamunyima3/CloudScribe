const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const { prisma } = require('../../config/database');
const { logger } = require('../../utils/logger');
const templates = require('./templates');
const cacheService = require('../cache/cache.service');
const { redis } = require('../../config/redis');

class NotificationService {
  constructor() {
    this.wss = null;
    this.healthCheckInterval = null;
    this.connections = new Map();
    this.initializeWebSocket();
  }

  initializeWebSocket() {
    this.wss = new WebSocket.Server({ noServer: true });

    this.wss.on('connection', (ws, userId) => {
      if (!ws || !userId) {
        logger.error('Invalid WebSocket connection attempt: missing ws or userId');
        if (ws) {
          ws.close(1008, 'Invalid connection parameters');
        }
        return;
      }

      // Check if user already has an existing connection
      const existingConnection = this.connections.get(userId);
      if (existingConnection) {
        logger.info(`Closing existing connection for user: ${userId}`);
        existingConnection.close(1000, 'New connection initiated');
      }

      // Set up the new connection
      this.connections.set(userId, ws);
      ws.isAlive = true;
      logger.info(`WebSocket connected for user: ${userId}`);

      // Set up ping-pong to detect stale connections
      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('close', () => {
        this.connections.delete(userId);
        logger.info(`WebSocket disconnected for user: ${userId}`);
      });

      ws.on('error', (error) => {
        logger.error(`WebSocket error for user ${userId}:`, error);
        this.connections.delete(userId);
      });
    });

    // Set up connection health check interval
    this.healthCheckInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.isAlive === false) {
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping(() => {});
      });
    }, 30000); // Check every 30 seconds

    this.wss.on('close', () => {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
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
    try {
      const connection = this.connections.get(userId);
      
      if (!connection) {
        logger.debug(`No active WebSocket connection for user: ${userId}`);
        return false;
      }

      if (connection.readyState !== WebSocket.OPEN) {
        logger.warn(`WebSocket not in OPEN state for user: ${userId}, current state: ${connection.readyState}`);
        // Clean up stale connection
        this.connections.delete(userId);
        return false;
      }

      connection.send(JSON.stringify(message));
      return true;
    } catch (error) {
      logger.error(`Failed to send message to user ${userId}:`, error);
      // Clean up potentially corrupted connection
      this.connections.delete(userId);
      return false;
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
    try {
      // First check Authorization header (more secure)
      const authHeader = request.headers['authorization'];
      let token;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      } else {
        // Fallback to Sec-WebSocket-Protocol header which is more secure than URL params
        const protocols = request.headers['sec-websocket-protocol'];
        if (protocols) {
          const authProtocol = protocols.split(', ').find(protocol => protocol.startsWith('token.'));
          if (authProtocol) {
            token = authProtocol.substring(6);
          }
        }
      }

      // If no token found in headers, reject the connection
      if (!token) {
        logger.warn('WebSocket connection attempt with no authentication token');
        return null;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      return decoded.userId;
    } catch (error) {
      logger.error('WebSocket authentication failed:', error);
      return null;
    }
  }

  close() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
    
    if (this.wss) {
      for (const [_, ws] of this.connections) {
        ws.close();
      }
      this.connections.clear();
      this.wss.close();
      this.wss = null;
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

// Add cleanup for tests
if (process.env.NODE_ENV === 'test') {
  afterAll(() => {
    notificationService.close();
  });
}

module.exports = notificationService; 