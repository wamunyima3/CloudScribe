const AuthService = require('./auth.service');
const { ApiResponse } = require('../../utils/response');
const logger = require('../../utils/logger');
const { ValidationError } = require('../../utils/errors');

class AuthController {
  static async register(req, res) {
    try {
      const user = await AuthService.register(req.body);
      return ApiResponse.success(res, user, 'Registration successful', 201);
    } catch (error) {
      logger.error('Registration error:', error);
      if (error instanceof ValidationError) {
        return ApiResponse.error(res, error.message, 400);
      }
      throw error;
    }
  }

  static async login(req, res) {
    try {
      const { token, user } = await AuthService.login(req.body);
      
      // Set HTTP-only cookie with token
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      return ApiResponse.success(res, { user }, 'Login successful');
    } catch (error) {
      logger.error('Login error:', error);
      if (error instanceof ValidationError) {
        return ApiResponse.error(res, error.message, 401);
      }
      throw error;
    }
  }

  static async logout(req, res) {
    res.clearCookie('token');
    return ApiResponse.success(res, null, 'Logout successful');
  }

  static async refreshToken(req, res) {
    try {
      const token = await AuthService.refreshToken(req.user.id);
      
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000
      });

      return ApiResponse.success(res, { token }, 'Token refreshed');
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  static async getProfile(req, res) {
    try {
      const profile = await AuthService.getProfile(req.user.id);
      return ApiResponse.success(res, profile);
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  static async updateProfile(req, res) {
    try {
      const profile = await AuthService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, profile, 'Profile updated successfully');
    } catch (error) {
      logger.error('Update profile error:', error);
      if (error instanceof ValidationError) {
        return ApiResponse.error(res, error.message, 400);
      }
      throw error;
    }
  }

  static async verifyEmail(req, res) {
    try {
      await AuthService.verifyEmail(req.query.token);
      return ApiResponse.success(res, null, 'Email verified successfully');
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  static async requestPasswordReset(req, res) {
    try {
      await AuthService.requestPasswordReset(req.body.email);
      return ApiResponse.success(
        res, 
        null, 
        'If your email exists in our system, you will receive a password reset link'
      );
    } catch (error) {
      logger.error('Password reset request error:', error);
      throw error;
    }
  }

  static async resetPassword(req, res) {
    try {
      await AuthService.resetPassword(req.query.token, req.body.password);
      return ApiResponse.success(res, null, 'Password reset successfully');
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }
}

module.exports = AuthController; 