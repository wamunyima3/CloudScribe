const DictionaryService = require('../services/dictionary.service');
const { asyncHandler } = require('../../../utils/async.handler');
const { ApiResponse } = require('../../../utils/response');

class DictionaryController {
  static searchWords = asyncHandler(async (req, res) => {
    const words = await DictionaryService.searchWords(req.query);
    return ApiResponse.success(res, words);
  });

  static addWord = asyncHandler(async (req, res) => {
    const word = await DictionaryService.addWord(req.body, req.user.id);
    return ApiResponse.success(res, word, 'Word added successfully', 201);
  });

  static updateWord = asyncHandler(async (req, res) => {
    const word = await DictionaryService.updateWord(req.params.id, req.body);
    return ApiResponse.success(res, word, 'Word updated successfully');
  });

  static deleteWord = asyncHandler(async (req, res) => {
    await DictionaryService.deleteWord(req.params.id);
    return ApiResponse.success(res, null, 'Word deleted successfully');
  });
}

module.exports = DictionaryController; 