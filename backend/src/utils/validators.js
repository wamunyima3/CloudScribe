const { z } = require('zod');

const commonValidators = {
  id: z.string().cuid(),
  email: z.string().email(),
  password: z.string().min(8).max(100),
  username: z.string().min(3).max(50),
  pagination: z.object({
    page: z.number().int().positive().optional(),
    limit: z.number().int().positive().max(100).optional()
  })
};

module.exports = commonValidators; 