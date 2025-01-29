const { logger } = require('./logger');

class ApiResponse {
  static success(res, data = null, message = 'Success', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, error) {
    const statusCode = error.statusCode || 500;
    const message = error.message || 'Internal server error';
    const errorCode = error.errorCode || 'SERVER_ERROR';

    return res.status(statusCode).json({
      success: false,
      message,
      error: {
        code: errorCode,
        details: error.details || null
      },
      timestamp: new Date().toISOString()
    });
  }

  static paginated(res, data, pagination) {
    return res.status(200).json({
      success: true,
      data,
      pagination,
      timestamp: new Date().toISOString()
    });
  }
}

// Pagination helper
const createPaginationOptions = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  return {
    page,
    limit,
    skip
  };
};

// Error response helper
const createErrorResponse = (error) => {
  if (Array.isArray(error)) {
    return {
      type: 'ValidationError',
      details: error
    };
  }

  return {
    type: error.name || 'Error',
    message: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  };
};

class ResponseUtil {
  static paginateResponse(data, page, limit, total) {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      data,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext,
        hasPrev,
        nextPage: hasNext ? page + 1 : null,
        prevPage: hasPrev ? page - 1 : null
      }
    };
  }

  static success(data, message = 'Success') {
    return {
      success: true,
      message,
      data
    };
  }

  static error(message = 'Error', code = 500) {
    return {
      success: false,
      message,
      code
    };
  }
}

module.exports = {
  ApiResponse,
  createPaginationOptions,
  createErrorResponse,
  ResponseUtil
}; 