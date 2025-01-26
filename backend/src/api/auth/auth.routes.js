const express = require('express');
const AuthController = require('./auth.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authSchema } = require('./auth.validation');
const { authMiddleware } = require('../../middleware/auth.middleware');

const router = express.Router();

router.post('/register', validate(authSchema.register), AuthController.register);
router.post('/login', validate(authSchema.login), AuthController.login);
router.post('/refresh-token', authMiddleware, AuthController.refreshToken);

module.exports = router; 