const logger = require('../utils/logger');
const { ApiResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  logger.error(err.stack);

  if (err.name === 'ValidationError') {
    return ApiResponse.error(res, err.message, 400, err.errors);
  }

  if (err.name === 'NotFoundError') {
    return ApiResponse.error(res, err.message, 404);
  }

  if (err.name === 'UnauthorizedError') {
    return ApiResponse.error(res, 'Unauthorized access', 401);
  }

  return ApiResponse.error(
    res, 
    process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    500
  );
};

module.exports = { errorHandler }; 