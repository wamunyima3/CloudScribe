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

const createApp = () => {
  const app = express();
  const server = http.createServer(app);

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));

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
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
    message: {
      status: 'error',
      message: 'Too many requests, please try again later.'
    }
  });
  app.use('/api', limiter);

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