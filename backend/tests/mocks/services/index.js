const { prisma } = require('../../../src/config/database');
const emailService = require('./email.service.mock');
const notificationService = require('./notification.service.mock');
const monitoringService = require('./monitoring.service.mock');
const dictionaryService = require('./dictionary.service.mock');
const cacheService = require('./cache.service.mock');

const clearDatabase = async () => {
  const tables = await prisma.$queryRaw`
    SELECT TABLE_NAME 
    FROM information_schema.TABLES 
    WHERE TABLE_SCHEMA = 'cloudscribe_test'
  `;

  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0`;

  for (const { TABLE_NAME } of tables) {
    if (TABLE_NAME !== '_prisma_migrations') {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE \`${TABLE_NAME}\``);
    }
  }

  await prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1`;
};

const closeConnections = async () => {
  await prisma.$disconnect();
};

// Ensure all mocks are loaded before tests
beforeAll(() => {
  jest.mock('../../../src/api/dictionary/services/dictionary.service');
  jest.mock('../../../src/services/email/email.service');
  jest.mock('../../../src/services/notification/notification.service');
  jest.mock('../../../src/services/monitoring/monitoring.service');
  jest.mock('../../../src/services/cache/cache.service');
});

module.exports = {
  emailService,
  notificationService,
  monitoringService,
  dictionaryService,
  cacheService,
  clearDatabase,
  closeConnections
}; 