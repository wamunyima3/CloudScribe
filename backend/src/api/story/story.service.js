const { prisma } = require('../../config/database');
const { NotFoundError, ValidationError } = require('../../utils/errors');
const { logger } = require('../../utils/logger');

class StoryService {
  async searchStories({ query, language, type, status, userId, tags, skip, limit, sortBy = 'createdAt', order = 'desc' }) {
    try {
      // Build where clause
      const where = {
        AND: [
          // Basic filters
          language && { language: { code: language.toUpperCase() } },
          type && { type },
          status && { status },
          userId && { userId },
          // Full text search if query provided
          query && {
            OR: [
              { title: { contains: query } },
              { content: { contains: query } }
            ]
          },
          // Tag filtering
          tags?.length > 0 && {
            tags: { some: { tag: { name: { in: tags } } } }
          }
        ].filter(Boolean)
      };

      // Get total count
      const total = await prisma.story.count({ where });

      // Get paginated results with ratings
      const stories = await prisma.story.findMany({
        where,
        include: {
          language: {
            select: { name: true, code: true }
          },
          user: {
            select: { username: true }
          },
          _count: {
            select: {
              comments: true,
              ratings: true
            }
          },
          ratings: {
            select: {
              rating: true
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

      // Calculate average ratings
      const data = stories.map(story => ({
        ...story,
        averageRating: story.ratings.length
          ? story.ratings.reduce((acc, curr) => acc + curr.rating, 0) / story.ratings.length
          : null,
        tags: story.tags.map(t => t.tag.name),
        ratings: undefined // Remove raw ratings from response
      }));

      return { data, total };
    } catch (error) {
      logger.error('Search stories error:', error);
      throw error;
    }
  }

  async createStory(storyData) {
    try {
      const story = await prisma.story.create({
        data: {
          title: storyData.title,
          content: storyData.content,
          languageId: storyData.languageId,
          userId: storyData.userId,
          type: storyData.type,
          tags: storyData.tags ? {
            create: storyData.tags.map(tagName => ({
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
          user: {
            select: { username: true }
          },
          tags: {
            include: {
              tag: true
            }
          }
        }
      });

      return story;
    } catch (error) {
      logger.error('Create story error:', error);
      throw error;
    }
  }

  // ... continued in next message due to length ...
}

module.exports = new StoryService(); 