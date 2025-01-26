const { RolePermissions } = require('../config/permissions');
const { UnauthorizedError } = require('../utils/errors');
const { logger } = require('../utils/logger');

class RBACMiddleware {
  // Check if user has required permissions
  static requirePermissions(...requiredPermissions) {
    return (req, res, next) => {
      try {
        const userRole = req.user.role;
        const userPermissions = RolePermissions[userRole];

        const hasPermission = requiredPermissions.every(permission =>
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          logger.warn('Permission denied', {
            userId: req.user.id,
            role: userRole,
            requiredPermissions,
            path: req.path
          });
          throw new UnauthorizedError('Insufficient permissions');
        }

        // Add permissions to request for further use
        req.permissions = userPermissions;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Check if user has any of the required permissions
  static requireAnyPermission(...requiredPermissions) {
    return (req, res, next) => {
      try {
        const userRole = req.user.role;
        const userPermissions = RolePermissions[userRole];

        const hasPermission = requiredPermissions.some(permission =>
          userPermissions.includes(permission)
        );

        if (!hasPermission) {
          logger.warn('Permission denied', {
            userId: req.user.id,
            role: userRole,
            requiredPermissions,
            path: req.path
          });
          throw new UnauthorizedError('Insufficient permissions');
        }

        req.permissions = userPermissions;
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Check if user owns the resource or has admin rights
  static requireOwnership(getResourceUserId) {
    return async (req, res, next) => {
      try {
        const userRole = req.user.role;
        
        // Admins bypass ownership check
        if (userRole === 'ADMIN') {
          return next();
        }

        const resourceUserId = await getResourceUserId(req);

        if (req.user.id !== resourceUserId) {
          logger.warn('Ownership check failed', {
            userId: req.user.id,
            resourceUserId,
            path: req.path
          });
          throw new UnauthorizedError('You do not own this resource');
        }

        next();
      } catch (error) {
        next(error);
      }
    };
  }
}

module.exports = RBACMiddleware; 