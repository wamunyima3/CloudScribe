const { ApiResponse } = require('../utils/response');
const { logger } = require('../utils/logger');
const { UnauthorizedError, ForbiddenError } = require('../utils/errors');

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

const rolePermissions = {
  ADMIN: ['*'],
  MODERATOR: [
    'dictionary:create',
    'dictionary:update',
    'dictionary:delete',
    'user:read'
  ],
  USER: [
    'dictionary:create',
    'dictionary:update',
    'user:read'
  ]
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
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      // Admin has all permissions
      if (req.user.role === 'ADMIN') {
        return next();
      }

      // Check role-based permissions
      const permissions = this.getRolePermissions(req.user.role);
      if (!permissions.includes(permission)) {
        throw new UnauthorizedError('Insufficient permissions');
      }

      next();
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

  static requireOwnership(getResourceUserId) {
    return async (req, res, next) => {
      if (!req.user) {
        throw new UnauthorizedError('Authentication required');
      }

      const resourceUserId = await getResourceUserId(req);
      if (req.user.id !== resourceUserId && req.user.role !== 'ADMIN') {
        throw new UnauthorizedError('Resource ownership required');
      }

      next();
    };
  }

  static getRolePermissions(role) {
    const permissions = {
      ADMIN: ['*'],
      CURATOR: [
        'dictionary:create',
        'dictionary:update',
        'dictionary:delete',
        'dictionary:approve'
      ],
      CONTRIBUTOR: [
        'dictionary:create',
        'dictionary:update'
      ],
      USER: [
        'dictionary:read'
      ]
    };

    return permissions[role] || [];
  }

  static check(permission) {
    return (req, res, next) => {
      try {
        const userRole = req.user?.role || 'USER';
        const permissions = rolePermissions[userRole] || [];
        
        if (permissions.includes('*') || permissions.includes(permission)) {
          return next();
        }
        
        throw new ForbiddenError('Insufficient permissions');
      } catch (error) {
        next(error);
      }
    };
  }
}

module.exports = RBACMiddleware; 