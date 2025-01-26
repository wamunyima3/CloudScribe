const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../../config/database');
const { ValidationError } = require('../../utils/errors');

class AuthService {
  static async register({ email, password, username }) {
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      throw new ValidationError('Email or username already exists');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    return prisma.user.create({
      data: {
        email,
        username,
        passwordHash
      },
      select: {
        id: true,
        email: true,
        username: true,
        role: true
      }
    });
  }

  static async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new ValidationError('Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new ValidationError('Invalid credentials');
    }

    const token = this.generateToken(user.id);
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginDate: new Date() }
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      }
    };
  }

  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }
}

module.exports = AuthService; 