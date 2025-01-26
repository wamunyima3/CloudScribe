const { prisma } = require('../../config/database');
const { NotFoundError, ValidationError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

class DictionaryService {
  async searchWords({ query, language, difficulty, tags, skip, limit, sortBy = 'createdAt', order = 'desc' }) {
    try {
      // Build where clause
      const where = {
        AND: [
          // Basic filters
          language && { language: { code: language.toUpperCase() } },
          difficulty && { difficulty },
          // Full text search if query provided
          query && {
            OR: [
              { original: { contains: query } },
              { translations: { some: { translation: { contains: query } } } }
            ]
          },
          // Tag filtering
          tags?.length > 0 && {
            tags: { some: { tag: { name: { in: tags } } } }
          }
        ].filter(Boolean)
      };

      // Get total count
      const total = await prisma.word.count({ where });

      // Get paginated results
      const data = await prisma.word.findMany({
        where,
        include: {
          language: {
            select: { name: true, code: true }
          },
          translations: {
            where: { verified: true },
            select: {
              id: true,
              translation: true,
              userId: true,
              verified: true
            }
          },
          tags: {
            select: {
              tag: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: { [sortBy]: order },
        skip,
        take: limit
      });

      return {
        data: data.map(word => ({
          ...word,
          tags: word.tags.map(t => t.tag.name)
        })),
        total
      };
    } catch (error) {
      logger.error('Search words error:', error);
      throw error;
    }
  }

  async addWord(wordData) {
    try {
      // Check if word exists in the same language
      const existingWord = await prisma.word.findUnique({
        where: {
          original_languageId: {
            original: wordData.original,
            languageId: wordData.languageId
          }
        }
      });

      if (existingWord) {
        throw new ValidationError('Word already exists in this language');
      }

      // Create word with translations and tags
      const word = await prisma.word.create({
        data: {
          original: wordData.original,
          languageId: wordData.languageId,
          difficulty: wordData.difficulty,
          approved: wordData.approved || false,
          addedById: wordData.addedById,
          translations: wordData.translations ? {
            create: wordData.translations.map(t => ({
              translation: t.translation,
              userId: wordData.addedById,
              verified: wordData.approved || false
            }))
          } : undefined,
          tags: wordData.tags ? {
            create: wordData.tags.map(tagName => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName }
                }
              }
            }))
          } : undefined
        },
        include: {
          language: true,
          translations: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      return word;
    } catch (error) {
      logger.error('Add word error:', error);
      throw error;
    }
  }

  async updateWord(id, updateData) {
    try {
      const word = await prisma.word.findUnique({
        where: { id },
        include: { tags: true }
      });

      if (!word) {
        throw new NotFoundError('Word not found');
      }

      // Update word with new data
      const updatedWord = await prisma.word.update({
        where: { id },
        data: {
          original: updateData.original,
          difficulty: updateData.difficulty,
          approved: updateData.approved,
          tags: updateData.tags ? {
            deleteMany: {},
            create: updateData.tags.map(tagName => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName }
                }
              }
            }))
          } : undefined
        },
        include: {
          language: true,
          translations: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      return updatedWord;
    } catch (error) {
      logger.error('Update word error:', error);
      throw error;
    }
  }

  async deleteWord(id) {
    try {
      const word = await prisma.word.findUnique({
        where: { id }
      });

      if (!word) {
        throw new NotFoundError('Word not found');
      }

      await prisma.word.delete({
        where: { id }
      });

      return true;
    } catch (error) {
      logger.error('Delete word error:', error);
      throw error;
    }
  }

  async approveWord(id) {
    try {
      const word = await prisma.word.findUnique({
        where: { id }
      });

      if (!word) {
        throw new NotFoundError('Word not found');
      }

      const updatedWord = await prisma.word.update({
        where: { id },
        data: {
          approved: true,
          translations: {
            updateMany: {
              where: { wordId: id },
              data: { verified: true }
            }
          }
        },
        include: {
          language: true,
          translations: true,
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      return updatedWord;
    } catch (error) {
      logger.error('Approve word error:', error);
      throw error;
    }
  }
}

module.exports = new DictionaryService(); 