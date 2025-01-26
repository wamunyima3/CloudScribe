const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const { UnauthorizedError } = require('../utils/errors');
const logger = require('../utils/logger');

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;
    
    if (!token) {
      throw new UnauthorizedError('Authentication required');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        lastActive: true
      }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    // Update last active timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActive: new Date() }
    });

    req.user = user;
    next();
  } catch (error) {
    logger.error('Auth middleware error:', error);
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid token');
    }
    throw error;
  }
};

const roleCheck = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('Insufficient permissions');
    }
    next();
  };
};

module.exports = { authMiddleware, roleCheck }; 