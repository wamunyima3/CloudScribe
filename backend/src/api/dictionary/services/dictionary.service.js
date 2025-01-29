const { prisma } = require('../../../config/database');
const { NotFoundError } = require('../../../utils/errors');

class DictionaryService {
  static async searchWords(query = {}) {
    const { search, language, limit = 10, page = 1 } = query;
    const skip = (page - 1) * limit;

    const where = {
      ...(search && {
        OR: [
          { text: { contains: search } },
          { definition: { contains: search } }
        ]
      }),
      ...(language && { languageId: language })
    };

    const [words, total] = await Promise.all([
      prisma.word.findMany({
        where,
        include: {
          language: true,
          tags: true,
          addedBy: {
            select: {
              id: true,
              username: true
            }
          }
        },
        skip,
        take: Number(limit)
      }),
      prisma.word.count({ where })
    ]);

    return {
      data: words,
      total,
      page: Number(page),
      limit: Number(limit)
    };
  }

  static async addWord(data, userId) {
    return prisma.word.create({
      data: {
        ...data,
        addedById: userId
      },
      include: {
        language: true,
        tags: true,
        addedBy: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  static async updateWord(id, data) {
    const word = await prisma.word.findUnique({ where: { id } });
    if (!word) {
      throw new NotFoundError('Word not found');
    }

    return prisma.word.update({
      where: { id },
      data,
      include: {
        language: true,
        tags: true,
        addedBy: {
          select: {
            id: true,
            username: true
          }
        }
      }
    });
  }

  static async deleteWord(id) {
    const word = await prisma.word.findUnique({ where: { id } });
    if (!word) {
      throw new NotFoundError('Word not found');
    }

    await prisma.word.delete({ where: { id } });
  }
}

module.exports = DictionaryService; 