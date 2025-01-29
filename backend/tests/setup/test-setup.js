const { prisma } = require('../../src/config/database');
const monitoringService = require('../../src/services/monitoring/monitoring.service');
const notificationService = require('../../src/services/notification/notification.service');
const emailService = require('../../src/services/email/email.service');

beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset intervals/timeouts
  jest.useRealTimers();
});

afterEach(async () => {
  // Clear database
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
});

afterAll(async () => {
  // Cleanup services
  await emailService.close();
  notificationService.close();
  monitoringService.close();
  
  // Cleanup database connection
  await prisma.$disconnect();
  
  // Clear all mocks
  jest.clearAllMocks();
  jest.useRealTimers();
}); 