const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { prisma } = require('../config/database');
const { logger } = require('../utils/logger');
const { ApiResponse } = require('../utils/response');

const securityMiddleware = {
  // Basic security headers using helmet
  securityHeaders() {
    return helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"]
        }
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: 'same-site' },
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: true,
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true
    });
  },

  // Rate limiting middleware
  rateLimiter(options = {}) {
    const defaultOptions = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later',
      standardHeaders: true,
      legacyHeaders: false
    };

    return rateLimit({
      ...defaultOptions,
      ...options,
      handler: (req, res) => {
        logger.warn('Rate limit exceeded', {
          ip: req.ip,
          path: req.path,
          headers: req.headers
        });
        return ApiResponse.error(res, 'Too many requests', 429);
      }
    });
  },

  // User-based rate limiting
  async userRateLimiter(req, res, next) {
    if (!req.user) return next();

    try {
      const key = `ratelimit:user:${req.user.id}`;
      const limit = 1000; // Higher limit for authenticated users
      const current = await prisma.userActivity.count({
        where: {
          userId: req.user.id,
          createdAt: {
            gte: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes
          }
        }
      });

      if (current >= limit) {
        logger.warn('User rate limit exceeded', { userId: req.user.id });
        return ApiResponse.error(res, 'Too many requests', 429);
      }

      next();
    } catch (error) {
      logger.error('User rate limit error:', error);
      next();
    }
  },

  // SQL Injection protection
  sqlInjectionProtection(req, res, next) {
    const checkForSQLInjection = (obj) => {
      const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)|(['"])/i;
      return Object.values(obj).some(value => {
        if (typeof value === 'string' && sqlPattern.test(value)) {
          return true;
        }
        if (typeof value === 'object' && value !== null) {
          return checkForSQLInjection(value);
        }
        return false;
      });
    };

    if (checkForSQLInjection(req.body) || checkForSQLInjection(req.query)) {
      logger.warn('Potential SQL injection detected', {
        ip: req.ip,
        path: req.path,
        body: req.body,
        query: req.query
      });
      return ApiResponse.error(res, 'Invalid input', 400);
    }

    next();
  },

  // XSS Protection
  xssProtection(req, res, next) {
    const sanitizeObject = (obj) => {
      Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'string') {
          obj[key] = obj[key]
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitizeObject(obj[key]);
        }
      });
    };

    if (req.body) sanitizeObject(req.body);
    if (req.query) sanitizeObject(req.query);

    next();
  },

  // IP Blocking
  async ipBlocking(req, res, next) {
    try {
      const blockedIP = await prisma.blockedIP.findUnique({
        where: { ip: req.ip }
      });

      if (blockedIP) {
        logger.warn('Blocked IP attempted access', { ip: req.ip });
        return ApiResponse.error(res, 'Access denied', 403);
      }

      next();
    } catch (error) {
      logger.error('IP blocking error:', error);
      next();
    }
  },

  // CSRF Protection
  csrfProtection(req, res, next) {
    const token = req.headers['x-csrf-token'];
    const sessionToken = req.session?.csrfToken;

    if (req.method !== 'GET' && (!token || token !== sessionToken)) {
      logger.warn('CSRF token validation failed', {
        ip: req.ip,
        path: req.path
      });
      return ApiResponse.error(res, 'Invalid CSRF token', 403);
    }

    next();
  },

  apiProtection: [
    helmet(),
    helmet.crossOriginResourcePolicy({ policy: "cross-origin" }),
    helmet.noSniff(),
    helmet.xssFilter(),
    helmet.hidePoweredBy()
  ],

  corsOptions: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    credentials: true,
    maxAge: 600
  }
};

module.exports = securityMiddleware; 