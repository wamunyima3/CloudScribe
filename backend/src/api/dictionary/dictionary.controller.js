const DictionaryService = require('./dictionary.service');
const { ApiResponse, createPaginationOptions } = require('../../utils/response');
const logger = require('../../utils/logger');
const { Permissions } = require('../../config/permissions');

class DictionaryController {
  static async searchWords(req, res) {
    try {
      const pagination = createPaginationOptions(req.query);
      const { query, language, difficulty, tags, sortBy, order } = req.query;

      const { data, total } = await DictionaryService.searchWords({
        query,
        language,
        difficulty,
        tags: tags?.split(','),
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
        'Words retrieved successfully'
      );
    } catch (error) {
      logger.error('Search words error:', error);
      throw error;
    }
  }

  static async addWord(req, res) {
    try {
      const wordData = {
        ...req.body,
        addedById: req.user.id,
        approved: req.permissions.includes(Permissions.WORD_APPROVE)
      };

      const word = await DictionaryService.addWord(wordData);
      return ApiResponse.success(res, word, 'Word added successfully', 201);
    } catch (error) {
      logger.error('Add word error:', error);
      throw error;
    }
  }

  static async updateWord(req, res) {
    try {
      const { id } = req.params;
      const canApprove = req.permissions.includes(Permissions.WORD_APPROVE);
      
      const word = await DictionaryService.updateWord(id, {
        ...req.body,
        approved: canApprove ? req.body.approved : undefined
      });

      return ApiResponse.success(res, word, 'Word updated successfully');
    } catch (error) {
      logger.error('Update word error:', error);
      throw error;
    }
  }

  static async deleteWord(req, res) {
    try {
      const { id } = req.params;
      await DictionaryService.deleteWord(id);
      return ApiResponse.success(res, null, 'Word deleted successfully');
    } catch (error) {
      logger.error('Delete word error:', error);
      throw error;
    }
  }

  static async approveWord(req, res) {
    try {
      const { id } = req.params;
      const word = await DictionaryService.approveWord(id);
      return ApiResponse.success(res, word, 'Word approved successfully');
    } catch (error) {
      logger.error('Approve word error:', error);
      throw error;
    }
  }

  static async addTranslation(req, res) {
    try {
      const { id } = req.params;
      const translationData = { ...req.body, userId: req.user.id, wordId: id };
      const translation = await DictionaryService.addTranslation(translationData);
      return ApiResponse.success(res, translation, 'Translation added successfully', 201);
    } catch (error) {
      logger.error('Error in addTranslation:', error);
      return ApiResponse.error(res, error.message);
    }
  }
}

module.exports = DictionaryController; 