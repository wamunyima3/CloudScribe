const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { NotFoundError, ValidationError } = require('../../utils/errors');

class DictionaryService {
  static async searchWords({ query, language, difficulty, page, limit }) {
    const skip = (page - 1) * limit;
    const where = {
      AND: [
        language ? { languageId: language } : {},
        difficulty ? { difficulty } : {},
        query ? { 
          OR: [
            { original: { contains: query, mode: 'insensitive' } },
            { translations: { some: { translation: { contains: query, mode: 'insensitive' } } } }
          ]
        } : {}
      ]
    };

    const [data, total] = await Promise.all([
      prisma.word.findMany({
        where,
        include: {
          translations: true,
          language: true,
          examples: true,
          synonyms: true,
          antonyms: true
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.word.count({ where })
    ]);

    return { data, total };
  }

  static async addWord(wordData) {
    const { languageId, original } = wordData;

    // Check for duplicate words
    const existingWord = await prisma.word.findFirst({
      where: {
        original,
        languageId
      }
    });

    if (existingWord) {
      throw new ValidationError('Word already exists in this language');
    }

    return prisma.word.create({
      data: wordData,
      include: {
        language: true,
        translations: true
      }
    });
  }

  // Add more methods...
}

module.exports = DictionaryService; 