const express = require('express');
const AuthController = require('./auth.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authSchema } = require('./auth.validation');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { auditLog } = require('../../middleware/audit.middleware');

const router = express.Router();

// Public routes
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 example: johndoe
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *                 example: securePassword123
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/register', 
  validate(authSchema.register), 
  auditLog('USER_REGISTER'),
  AuthController.register
);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and get token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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