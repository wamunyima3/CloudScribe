const createPagination = (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  return {
    skip,
    take: parseInt(limit),
    page: parseInt(page)
  };
};

module.exports = { createPagination }; 