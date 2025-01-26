const { ApiResponse } = require('../../utils/response');
const DictionaryService = require('./dictionary.service');
const logger = require('../../utils/logger');

class DictionaryController {
  static async searchWords(req, res) {
    try {
      const { query, language, difficulty, page = 1, limit = 10 } = req.query;
      const result = await DictionaryService.searchWords({
        query,
        language,
        difficulty,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      return ApiResponse.paginate(res, result.data, page, limit, result.total);
    } catch (error) {
      logger.error('Error in searchWords:', error);
      return ApiResponse.error(res, error.message);
    }
  }

  static async addWord(req, res) {
    try {
      const wordData = { ...req.body, addedById: req.user.id };
      const word = await DictionaryService.addWord(wordData);
      return ApiResponse.success(res, word, 'Word added successfully', 201);
    } catch (error) {
      logger.error('Error in addWord:', error);
      return ApiResponse.error(res, error.message);
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