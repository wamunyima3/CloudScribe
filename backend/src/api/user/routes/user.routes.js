const express = require('express');
const UserController = require('./user.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authMiddleware } = require('../../middleware/auth.middleware');
const RBACMiddleware = require('../../middleware/rbac.middleware');
const { Permissions } = require('../../config/permissions');
const { userSchema } = require('./user.validation');
const { auditLog } = require('../../middleware/audit.middleware');

const router = express.Router();

// Protected routes - all require authentication
router.use(authMiddleware);

// User profile routes
router.get('/profile',
  UserController.getProfile
);

router.put('/profile',
  validate(userSchema.updateProfile),
  auditLog('PROFILE_UPDATE'),
  UserController.updateProfile
);

router.put('/preferences',
  validate(userSchema.updatePreferences),
  auditLog('PREFERENCES_UPDATE'),
  UserController.updatePreferences
);

router.get('/activity',
  UserController.getActivityLog
);

router.get('/stats',
  UserController.getStats
);

// Admin routes
router.get('/search',
  RBACMiddleware.requirePermissions(Permissions.USER_READ),
  validate(userSchema.searchUsers),
  UserController.searchUsers
);

router.post('/',
  RBACMiddleware.requirePermissions(Permissions.USER_MANAGE),
  validate(userSchema.createUser),
  auditLog('USER_CREATE'),
  UserController.createUser
);

router.put('/:id',
  RBACMiddleware.requirePermissions(Permissions.USER_MANAGE),
  validate(userSchema.updateUser),
  auditLog('USER_UPDATE'),
  UserController.updateUser
);

router.delete('/:id',
  RBACMiddleware.requirePermissions(Permissions.USER_DELETE),
  auditLog('USER_DELETE'),
  UserController.deleteUser
);

module.exports = router; 