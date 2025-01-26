const { z } = require('zod');

const wordSchema = z.object({
  original: z.string().min(1).max(100),
  languageId: z.string().cuid(),
  difficulty: z.number().int().min(1).max(5).optional(),
  tags: z.array(z.string()).optional(),
});

const translationSchema = z.object({
  translation: z.string().min(1).max(500),
  notes: z.string().max(1000).optional(),
});

module.exports = {
  wordSchema,
  translationSchema
}; 