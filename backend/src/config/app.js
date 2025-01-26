const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { errorHandler } = require('../middleware/error.middleware');
const routes = require('../api');

const createApp = () => {
  const app = express();

  // Middleware
  app.use(helmet());
  app.use(cors());
  app.use(compression());
  app.use(cookieParser());
  app.use(express.json());
  app.use(morgan('dev'));

  // API Routes
  app.use('/api', routes);

  // Error handling
  app.use(errorHandler);

  return app;
};

module.exports = createApp; 