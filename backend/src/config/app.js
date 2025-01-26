const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('../middleware/error.middleware');
const routes = require('../api');
const { logger, requestLogger } = require('../utils/logger');
const notificationService = require('../services/notification/notification.service');
const SecurityMiddleware = require('../middleware/security.middleware');

const createApp = () => {
  const app = express();
  const server = http.createServer(app);

  // Security middleware
  app.use(SecurityMiddleware.securityHeaders());
  app.use(SecurityMiddleware.ipBlocking);
  app.use(SecurityMiddleware.xssProtection);
  app.use(SecurityMiddleware.sqlInjectionProtection);

  // Request ID and logging middleware
  app.use(requestLogger);

  // General middleware
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(morgan('combined', { 
    stream: { 
      write: (message) => {
        logger.info(message.trim());
      }
    },
    skip: (req) => req.path === '/health'  // Skip logging health checks
  }));

  // Rate limiting
  app.use('/api', SecurityMiddleware.rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Limit each IP to 100 requests per windowMs
  }));

  // Protected routes rate limiting
  app.use('/api/protected/*', SecurityMiddleware.rateLimiter({
    windowMs: 15 * 60 * 1000,
    max: 50 // Stricter limit for protected routes
  }));

  // User-based rate limiting for authenticated routes
  app.use('/api/auth/*', SecurityMiddleware.userRateLimiter);

  // CSRF protection for non-GET requests
  app.use((req, res, next) => {
    if (req.method !== 'GET') {
      return SecurityMiddleware.csrfProtection(req, res, next);
    }
    next();
  });

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Root route
  app.get('/', (req, res) => {
    res.json({
      name: 'CloudScribe API',
      version: '1.0.0',
      description: 'Language Learning and Cultural Preservation Platform API',
      endpoints: {
        base: '/api',
        documentation: '/api/docs',
        health: '/health',
        auth: {
          register: '/api/auth/register',
          login: '/api/auth/login',
          logout: '/api/auth/logout',
          profile: '/api/auth/profile'
        },
        dictionary: {
          search: '/api/dictionary/search',
          addWord: '/api/dictionary',
          updateWord: '/api/dictionary/:id',
          addTranslation: '/api/dictionary/:id/translations'
        }
      }
    });
  });

  // API Routes
  app.use('/api', routes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ 
      success: false, 
      message: 'Route not found',
      path: req.originalUrl
    });
  });

  // Error handling
  app.use(errorHandler);

  // Handle WebSocket upgrade
  server.on('upgrade', (request, socket, head) => {
    if (request.url.startsWith('/ws/notifications')) {
      notificationService.handleUpgrade(request, socket, head);
    } else {
      socket.destroy();
    }
  });

  return server;
};

module.exports = createApp; 