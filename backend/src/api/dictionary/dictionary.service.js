const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { NotFoundError, ValidationError } = require('../../utils/errors');

class DictionaryService {
  static async searchWords({ query, language, difficulty, tags, page, limit }) {
    const skip = (page - 1) * limit;
    const where = {
      AND: [
        language ? { languageId: language } : {},
        difficulty ? { difficulty } : {},
        query ? { 
          OR: [
            { original: { contains: query } },
            { translations: { some: { translation: { contains: query } } } }
          ]
        } : {},
        tags ? {
          tags: {
            some: {
              tag: {
                name: { in: tags }
              }
            }
          }
        } : {}
      ]
    };

    const [data, total] = await Promise.all([
      prisma.word.findMany({
        where,
        include: {
          translations: true,
          language: true,
          tags: {
            include: {
              tag: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.word.count({ where })
    ]);

    return { data, total };
  }

  static async addWord({ original, languageId, difficulty, tags, ...rest }) {
    const existingWord = await prisma.word.findFirst({
      where: { original, languageId }
    });

    if (existingWord) {
      throw new ValidationError('Word already exists in this language');
    }

    // Create word and its tags in a transaction
    return prisma.$transaction(async (tx) => {
      // Create the word
      const word = await tx.word.create({
        data: {
          original,
          languageId,
          difficulty,
          ...rest
        }
      });

      // Handle tags if provided
      if (tags && tags.length > 0) {
        // Create or connect tags
        for (const tagName of tags) {
          const tag = await tx.tag.upsert({
            where: { name: tagName },
            create: { name: tagName },
            update: {}
          });

          // Create word-tag connection
          await tx.wordTag.create({
            data: {
              wordId: word.id,
              tagId: tag.id
            }
          });
        }
      }

      // Return word with its tags
      return tx.word.findUnique({
        where: { id: word.id },
        include: {
          tags: {
            include: {
              tag: true
            }
          }
        }
      });
    });
  }

  // Add more methods...
}

module.exports = DictionaryService; 