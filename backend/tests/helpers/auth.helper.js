const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../../src/config/database');

const createTestUser = async (overrides = {}) => {
  const defaultUser = {
    email: 'test@example.com',
    username: 'testuser',
    passwordHash: await bcrypt.hash('password123', 10),
    role: 'USER',
    emailVerified: true,
    points: 0,
    streak: 0
  };

  const user = await prisma.user.create({
    data: {
      ...defaultUser,
      ...overrides
    }
  });

  return user;
};

const generateTestToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const clearTestData = async () => {
  await prisma.user.deleteMany();
  // Add other model cleanups as needed
};

module.exports = {
  createTestUser,
  generateTestToken,
  clearTestData
}; 