const { prisma } = require('../src/config/database');
const { logger } = require('../src/utils/logger');

// Disable logging during tests
logger.silent = true;

// Clean up database after each test
afterEach(async () => {
  const tables = Reflect.ownKeys(prisma).filter(key => {
    return typeof prisma[key] === 'object' && prisma[key].deleteMany;
  });

  await Promise.all(
    tables.map(table => prisma[table].deleteMany())
  );
});

// Close Prisma connection after all tests
afterAll(async () => {
  await prisma.$disconnect();
}); 