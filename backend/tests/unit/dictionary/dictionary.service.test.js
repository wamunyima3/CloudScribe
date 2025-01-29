const DictionaryService = require('../../../src/api/dictionary/services/dictionary.service');
const { prisma } = require('../../../src/config/database');

describe('DictionaryService', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        username: `testuser-${Date.now()}`,
        passwordHash: 'test-hash',
        role: 'USER',
        emailVerified: true
      }
    });
  });

  describe('searchWords', () => {
    it('should return words matching search criteria', async () => {
      // Create test words
      await prisma.word.create({
        data: {
          text: 'apple',
          definition: 'test definition',
          languageId: 'en',
          addedById: testUser.id,
          original: 'apple' // Add required field
        }
      });

      const result = await DictionaryService.searchWords({ search: 'app' });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].text).toBe('apple');
    });
  });

  describe('addWord', () => {
    it('should add a new word successfully', async () => {
      const wordData = {
        text: 'test',
        definition: 'a test word',
        languageId: 'en',
        original: 'test' // Add required field
      };

      const result = await DictionaryService.addWord(wordData, testUser.id);

      expect(result).toMatchObject({
        text: wordData.text,
        definition: wordData.definition,
        languageId: wordData.languageId
      });
    });
  });
}); 