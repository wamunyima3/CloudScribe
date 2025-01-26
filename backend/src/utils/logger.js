const winston = require('winston');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
require('winston-daily-rotate-file');

// Define log directory
const logDir = path.join(__dirname, '../../logs');

// Define log formats
const formats = {
  console: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, requestId, ...meta }) => {
      const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
      const reqId = requestId ? `[${requestId}] ` : '';
      return `${timestamp} ${level}: ${reqId}${message} ${metaStr}`;
    })
  ),
  file: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  )
};

// Create transports
const transports = {
  console: new winston.transports.Console({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  }),
  
  // Error logs
  error: new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxFiles: '30d',
    format: formats.file
  }),
  
  // Combined logs
  combined: new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    format: formats.file
  }),

  // HTTP access logs
  access: new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxFiles: '30d',
    format: formats.file
  })
};

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'cloudscribe-api' },
  transports: [
    transports.console,
    transports.error,
    transports.combined
  ]
});

// Add request ID tracking middleware
const requestLogger = (req, res, next) => {
  req.requestId = uuidv4();
  
  // Log request
  logger.info(`${req.method} ${req.originalUrl}`, {
    requestId: req.requestId,
    ip: req.ip,
    userAgent: req.get('user-agent')
  });

  // Log response
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      requestId: req.requestId,
      statusCode: res.statusCode,
      duration
    });
  });

  next();
};

// Export logger instance and middleware
module.exports = {
  logger,
  requestLogger,
  // Utility functions
  error: (message, meta = {}) => {
    logger.error(message, meta);
  },
  warn: (message, meta = {}) => {
    logger.warn(message, meta);
  },
  info: (message, meta = {}) => {
    logger.info(message, meta);
  },
  debug: (message, meta = {}) => {
    logger.debug(message, meta);
  },
  // Stream for Morgan
  stream: {
    write: (message) => {
      logger.info(message.trim());
    }
  }
}; 