const UserService = require('./user.service');
const { ApiResponse, createPaginationOptions } = require('../../utils/response');
const { logger } = require('../../utils/logger');

class UserController {
  static async getProfile(req, res) {
    try {
      const profile = await UserService.getProfile(req.user.id);
      return ApiResponse.success(res, profile);
    } catch (error) {
      logger.error('Get profile error:', error);
      throw error;
    }
  }

  static async updateProfile(req, res) {
    try {
      const profile = await UserService.updateProfile(req.user.id, req.body);
      return ApiResponse.success(res, profile, 'Profile updated successfully');
    } catch (error) {
      logger.error('Update profile error:', error);
      throw error;
    }
  }

  static async updatePreferences(req, res) {
    try {
      const preferences = await UserService.updatePreferences(req.user.id, req.body);
      return ApiResponse.success(res, preferences, 'Preferences updated successfully');
    } catch (error) {
      logger.error('Update preferences error:', error);
      throw error;
    }
  }

  static async getActivityLog(req, res) {
    try {
      const logs = await UserService.getActivityLog(req.user.id);
      return ApiResponse.success(res, logs);
    } catch (error) {
      logger.error('Get activity log error:', error);
      throw error;
    }
  }

  static async getStats(req, res) {
    try {
      const stats = await UserService.getStats(req.user.id);
      return ApiResponse.success(res, stats);
    } catch (error) {
      logger.error('Get stats error:', error);
      throw error;
    }
  }

  // Admin endpoints
  static async searchUsers(req, res) {
    try {
      const pagination = createPaginationOptions(req.query);
      const { query, role, active, sortBy, order } = req.query;

      const { data, total } = await UserService.searchUsers({
        query,
        role,
        active: active === 'true',
        sortBy,
        order,
        ...pagination
      });

      return ApiResponse.paginated(
        res,
        data,
        pagination.page,
        pagination.limit,
        total,
        'Users retrieved successfully'
      );
    } catch (error) {
      logger.error('Search users error:', error);
      throw error;
    }
  }

  static async createUser(req, res) {
    try {
      const user = await UserService.createUser(req.body);
      return ApiResponse.success(res, user, 'User created successfully', 201);
    } catch (error) {
      logger.error('Create user error:', error);
      throw error;
    }
  }

  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const user = await UserService.updateUser(id, req.body);
      return ApiResponse.success(res, user, 'User updated successfully');
    } catch (error) {
      logger.error('Update user error:', error);
      throw error;
    }
  }

  static async deleteUser(req, res) {
    try {
      const { id } = req.params;
      await UserService.deleteUser(id);
      return ApiResponse.success(res, null, 'User deleted successfully');
    } catch (error) {
      logger.error('Delete user error:', error);
      throw error;
    }
  }
}

module.exports = UserController; 