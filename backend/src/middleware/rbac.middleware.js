const { ApiResponse } = require('../utils/response');
const { logger } = require('../utils/logger');

const roles = {
  ADMIN: 4,
  CURATOR: 3,
  CONTRIBUTOR: 2,
  USER: 1,
  VISITOR: 0
};

const permissions = {
  // Dictionary permissions
  'dictionary:create': ['ADMIN', 'CURATOR'],
  'dictionary:update': ['ADMIN', 'CURATOR'],
  'dictionary:delete': ['ADMIN'],
  'dictionary:approve': ['ADMIN', 'CURATOR'],
  
  // Story permissions
  'story:create': ['ADMIN', 'CURATOR', 'CONTRIBUTOR', 'USER'],
  'story:update': ['ADMIN', 'CURATOR', 'CONTRIBUTOR'],
  'story:delete': ['ADMIN', 'CURATOR'],
  'story:moderate': ['ADMIN', 'CURATOR'],
  
  // User permissions
  'user:manage': ['ADMIN'],
  'user:view': ['ADMIN', 'CURATOR'],
  
  // System permissions
  'system:settings': ['ADMIN'],
  'system:logs': ['ADMIN']
};

class RBACMiddleware {
  static hasRole(requiredRole) {
    return (req, res, next) => {
      try {
        const userRole = req.user?.role || 'VISITOR';
        
        if (roles[userRole] >= roles[requiredRole]) {
          return next();
        }
        
        logger.warn('Insufficient role access', {
          userId: req.user?.id,
          requiredRole,
          userRole
        });
        
        return ApiResponse.error(res, 'Insufficient permissions', 403);
      } catch (error) {
        logger.error('RBAC role check error:', error);
        return ApiResponse.error(res, 'Authorization error', 500);
      }
    };
  }

  static hasPermission(permission) {
    return (req, res, next) => {
      try {
        const userRole = req.user?.role || 'VISITOR';
        
        if (!permissions[permission]) {
          logger.error(`Unknown permission: ${permission}`);
          return ApiResponse.error(res, 'Invalid permission configuration', 500);
        }
        
        if (permissions[permission].includes(userRole)) {
          return next();
        }
        
        logger.warn('Insufficient permission', {
          userId: req.user?.id,
          permission,
          userRole
        });
        
        return ApiResponse.error(res, 'Insufficient permissions', 403);
      } catch (error) {
        logger.error('RBAC permission check error:', error);
        return ApiResponse.error(res, 'Authorization error', 500);
      }
    };
  }

  static hasAnyPermission(permissionList) {
    return (req, res, next) => {
      try {
        const userRole = req.user?.role || 'VISITOR';
        
        const hasPermission = permissionList.some(permission => {
          if (!permissions[permission]) {
            logger.error(`Unknown permission: ${permission}`);
            return false;
          }
          return permissions[permission].includes(userRole);
        });
        
        if (hasPermission) {
          return next();
        }
        
        logger.warn('Insufficient permissions', {
          userId: req.user?.id,
          permissionList,
          userRole
        });
        
        return ApiResponse.error(res, 'Insufficient permissions', 403);
      } catch (error) {
        logger.error('RBAC permissions check error:', error);
        return ApiResponse.error(res, 'Authorization error', 500);
      }
    };
  }
}

module.exports = RBACMiddleware; 