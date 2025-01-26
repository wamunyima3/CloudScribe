const DictionaryService = require('./dictionary.service');
const { ApiResponse, createPaginationOptions } = require('../../utils/response');
const logger = require('../../utils/logger');

class DictionaryController {
  static async searchWords(req, res) {
    try {
      const pagination = createPaginationOptions(req.query);
      const { query, language, difficulty, tags } = req.query;

      const { data, total } = await DictionaryService.searchWords({
        query,
        language,
        difficulty,
        tags,
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
      const word = await DictionaryService.addWord({
        ...req.body,
        addedById: req.user.id
      });

      return ApiResponse.success(
        res,
        word,
        'Word added successfully',
        201
      );
    } catch (error) {
      logger.error('Add word error:', error);
      throw error;
    }
  }

  static async updateWord(req, res) {
    try {
      const { id } = req.params;
      const word = await DictionaryService.updateWord(id, req.body);
      return ApiResponse.success(res, word, 'Word updated successfully');
    } catch (error) {
      logger.error('Error in updateWord:', error);
      return ApiResponse.error(res, error.message);
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