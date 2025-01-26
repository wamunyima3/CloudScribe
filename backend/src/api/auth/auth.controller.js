const AuthService = require('./auth.service');
const { ApiResponse } = require('../../utils/response');
const logger = require('../../utils/logger');

class AuthController {
  static async register(req, res) {
    try {
      const user = await AuthService.register(req.body);
      return ApiResponse.success(res, user, 'Registration successful', 201);
    } catch (error) {
      logger.error('Registration error:', error);
      return ApiResponse.error(res, error.message);
    }
  }

  static async login(req, res) {
    try {
      const { token, user } = await AuthService.login(req.body);
      return ApiResponse.success(res, { token, user }, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      return ApiResponse.error(res, error.message, 401);
    }
  }

  static async refreshToken(req, res) {
    try {
      const token = await AuthService.refreshToken(req.user.id);
      return ApiResponse.success(res, { token }, 'Token refreshed');
    } catch (error) {
      logger.error('Token refresh error:', error);
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = AuthController; 