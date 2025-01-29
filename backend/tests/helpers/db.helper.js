const { prisma } = require('../../src/config/database');

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

const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    email: `test-${Date.now()}@example.com`,
    username: `testuser-${Date.now()}`,
    passwordHash: 'hashed_password',
    role: 'USER',
    emailVerified: true
  };

  return prisma.user.create({
    data: {
      ...defaultUser,
      ...overrides
    }
  });
};

const createTestWord = async (userId, overrides = {}) => {
  const defaultWord = {
    text: `test-word-${Date.now()}`,
    definition: 'test definition',
    languageId: 'en',
    addedById: userId,
    original: `test-word-${Date.now()}`
  };

  return prisma.word.create({
    data: {
      ...defaultWord,
      ...overrides
    }
  });
};

module.exports = {
  clearDatabase,
  createTestUser,
  createTestWord
}; 