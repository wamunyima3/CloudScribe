const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { errorHandler } = require('../middleware/error.middleware');
const routes = require('../api');
const rateLimit = require('express-rate-limit');

const createApp = () => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(morgan('dev'));

  // Rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
  });
  app.use('/api', limiter);

  // API Routes
  app.use('/api', routes);

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({ 
      success: false, 
      message: 'Route not found' 
    });
  });

  // Error handling
  app.use(errorHandler);

  return app;
};

module.exports = createApp; 