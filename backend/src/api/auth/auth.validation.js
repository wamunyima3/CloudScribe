const { z } = require('zod');
const commonValidators = require('../../utils/validators');

const authSchema = {
  register: z.object({
    email: commonValidators.email,
    password: commonValidators.password,
    username: commonValidators.username
  }),

  login: z.object({
    email: commonValidators.email,
    password: z.string()
  })
};

module.exports = { authSchema }; 