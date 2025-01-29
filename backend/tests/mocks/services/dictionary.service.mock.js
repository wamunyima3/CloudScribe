const mockDictionaryService = {
  searchWords: jest.fn().mockResolvedValue({
    data: [],
    total: 0,
    page: 1,
    limit: 10
  }),
  addWord: jest.fn().mockImplementation(async (data, userId) => ({
    id: 'test-word-id',
    ...data,
    addedById: userId,
    createdAt: new Date(),
    updatedAt: new Date()
  })),
  updateWord: jest.fn().mockImplementation(async (id, data) => ({
    id,
    ...data,
    updatedAt: new Date()
  })),
  deleteWord: jest.fn().mockResolvedValue(true)
};

// Use manual mocking
jest.mock('../../../src/api/dictionary/services/dictionary.service', () => mockDictionaryService);

module.exports = mockDictionaryService; 