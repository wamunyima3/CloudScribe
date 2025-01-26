const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('../middleware/error.middleware');
const routes = require('../api');
const logger = require('../utils/logger');

const createApp = () => {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
  }));

  // General middleware
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

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

  return app;
};

module.exports = createApp; 