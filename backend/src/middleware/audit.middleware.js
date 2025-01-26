const prisma = require('../config/database');

const auditLog = (action) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    res.json = async function(data) {
      await prisma.auditLog.create({
        data: {
          userId: req.user?.id,
          action,
          entity: req.baseUrl.split('/').pop(),
          entityId: req.params.id || data?.id,
          details: data
        }
      });
      return originalJson.call(this, data);
    };
    next();
  };
};

module.exports = { auditLog }; 