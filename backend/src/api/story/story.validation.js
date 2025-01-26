const { z } = require('zod');

const storySchema = {
  createStory: z.object({
    title: z.string().min(3).max(255),
    content: z.string().min(10),
    languageId: z.string().cuid(),
    type: z.enum(['STORY', 'PROVERB', 'POEM', 'SONG']),
    tags: z.array(z.string()).optional()
  }),

  updateStory: z.object({
    title: z.string().min(3).max(255).optional(),
    content: z.string().min(10).optional(),
    type: z.enum(['STORY', 'PROVERB', 'POEM', 'SONG']).optional(),
    tags: z.array(z.string()).optional()
  }),

  createComment: z.object({
    content: z.string().min(1).max(1000)
  }),

  updateComment: z.object({
    content: z.string().min(1).max(1000)
  }),

  rateStory: z.object({
    rating: z.number().int().min(1).max(5)
  }),

  moderateStory: z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'PENDING']),
    reason: z.string().optional()
  }),

  searchStories: z.object({
    query: z.string().optional(),
    language: z.string().length(2).optional(),
    type: z.enum(['STORY', 'PROVERB', 'POEM', 'SONG']).optional(),
    status: z.enum(['APPROVED', 'REJECTED', 'PENDING']).optional(),
    userId: z.string().cuid().optional(),
    tags: z.array(z.string()).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(['title', 'createdAt', 'rating']).optional(),
    order: z.enum(['asc', 'desc']).optional()
  })
};

module.exports = { storySchema }; 