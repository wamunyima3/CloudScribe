const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { prisma } = require('../src/config/database');

const testHelpers = {
  createTestUser: async (data = {}) => {
    const defaultData = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
      role: 'USER'
    };

    const userData = { ...defaultData, ...data };
    const passwordHash = await bcrypt.hash(userData.password, 10);

    const user = await prisma.user.create({
      data: {
        email: userData.email,
        username: userData.username,
        passwordHash,
        role: userData.role,
        emailVerified: true
      }
    });

    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return { user, token };
  },

  createTestWord: async (userId, data = {}) => {
    const defaultData = {
      original: 'test word',
      languageId: 'test-lang',
      difficulty: 1
    };

    return prisma.word.create({
      data: {
        ...defaultData,
        ...data,
        addedById: userId
      }
    });
  },

  createTestStory: async (userId, data = {}) => {
    const defaultData = {
      title: 'Test Story',
      content: 'Test content',
      languageId: 'test-lang',
      type: 'STORY'
    };

    return prisma.story.create({
      data: {
        ...defaultData,
        ...data,
        userId
      }
    });
  }
};

module.exports = testHelpers; 