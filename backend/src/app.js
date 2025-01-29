const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { logger } = require('./utils/logger');
const routes = require('./routes');  // Use the routes from src/routes/index.js
const errorHandler = require('./middleware/error.middleware');
const { requestLogger } = require('./utils/logger');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

module.exports = app; 