const { ApiResponse } = require('../utils/response');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return ApiResponse.error(res, 'Validation error', 400, error.errors);
    }
  };
};

module.exports = { validate }; 