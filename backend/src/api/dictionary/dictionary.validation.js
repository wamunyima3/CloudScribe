const { z } = require('zod');

const dictionarySchema = {
  createWord: z.object({
    original: z.string().min(1).max(255),
    languageId: z.string().cuid(),
    difficulty: z.number().int().min(1).max(5).default(1),
    translations: z.array(z.object({
      translation: z.string().min(1),
      languageId: z.string().cuid()
    })).optional(),
    tags: z.array(z.string()).optional()
  }),

  updateWord: z.object({
    original: z.string().min(1).max(255).optional(),
    difficulty: z.number().int().min(1).max(5).optional(),
    approved: z.boolean().optional(),
    translations: z.array(z.object({
      translation: z.string().min(1),
      languageId: z.string().cuid()
    })).optional(),
    tags: z.array(z.string()).optional()
  }),

  searchQuery: z.object({
    query: z.string().optional(),
    language: z.string().length(2).optional(),
    difficulty: z.number().int().min(1).max(5).optional(),
    tags: z.array(z.string()).optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(['original', 'difficulty', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).optional()
  })
};

module.exports = { dictionarySchema }; 