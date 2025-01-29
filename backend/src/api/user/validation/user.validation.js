const { z } = require('zod');

const userSchema = {
  updateProfile: z.object({
    username: z.string().min(3).max(30).optional(),
    email: z.string().email().optional(),
    currentPassword: z.string().min(8).optional(),
    newPassword: z.string().min(8).optional(),
    preferences: z.object({
      language: z.string().length(2).optional(),
      theme: z.enum(['light', 'dark', 'system']).optional(),
      notifications: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
        frequency: z.enum(['daily', 'weekly', 'never']).optional()
      }).optional()
    }).optional()
  }),

  updatePreferences: z.object({
    language: z.string().length(2).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      frequency: z.enum(['daily', 'weekly', 'never'])
    }).optional()
  }),

  // Admin only schemas
  createUser: z.object({
    email: z.string().email(),
    username: z.string().min(3).max(30),
    password: z.string().min(8),
    role: z.enum(['ADMIN', 'CURATOR', 'CONTRIBUTOR', 'USER', 'VISITOR'])
  }),

  updateUser: z.object({
    email: z.string().email().optional(),
    username: z.string().min(3).max(30).optional(),
    role: z.enum(['ADMIN', 'CURATOR', 'CONTRIBUTOR', 'USER', 'VISITOR']).optional(),
    active: z.boolean().optional()
  }),

  searchUsers: z.object({
    query: z.string().optional(),
    role: z.enum(['ADMIN', 'CURATOR', 'CONTRIBUTOR', 'USER', 'VISITOR']).optional(),
    active: z.boolean().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sortBy: z.enum(['username', 'email', 'createdAt', 'lastActive']).optional(),
    order: z.enum(['asc', 'desc']).optional()
  })
};

module.exports = { userSchema }; 