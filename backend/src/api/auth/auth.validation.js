const { z } = require('zod');
const commonValidators = require('../../utils/validators');

const authSchema = {
  register: z.object({
    email: z.string().email(),
    username: z.string().min(3).max(30),
    password: z.string().min(8)
  }),

  login: z.object({
    email: z.string().email(),
    password: z.string()
  }),

  verifyEmail: z.object({
    token: z.string()
  }),

  requestReset: z.object({
    email: z.string().email()
  }),

  resetPassword: z.object({
    token: z.string(),
    password: z.string().min(8)
  })
};

module.exports = { authSchema }; 