const express = require('express');
const AuthController = require('./auth.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authSchema } = require('./auth.validation');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { auditLog } = require('../../middleware/audit.middleware');

const router = express.Router();

// Public routes
router.post('/register', 
  validate(authSchema.register), 
  auditLog('USER_REGISTER'),
  AuthController.register
);

router.post('/login', 
  validate(authSchema.login),
  auditLog('USER_LOGIN'), 
  AuthController.login
);

router.get('/verify-email',
  validate(authSchema.verifyEmail),
  auditLog('EMAIL_VERIFY'),
  AuthController.verifyEmail
);

router.post('/request-reset',
  validate(authSchema.requestReset),
  auditLog('PASSWORD_RESET_REQUEST'),
  AuthController.requestPasswordReset
);

router.post('/reset-password',
  validate(authSchema.resetPassword),
  auditLog('PASSWORD_RESET'),
  AuthController.resetPassword
);

// Protected routes
router.use(authMiddleware);

router.post('/logout',
  auditLog('USER_LOGOUT'),
  AuthController.logout
);

router.post('/refresh-token',
  AuthController.refreshToken
);

router.get('/profile',
  AuthController.getProfile
);

router.put('/profile',
  validate(authSchema.updateProfile),
  auditLog('PROFILE_UPDATE'),
  AuthController.updateProfile
);

module.exports = router; 