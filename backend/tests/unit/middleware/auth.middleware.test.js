const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../auth.middleware');
const { prisma } = require('../../config/database');

describe('authMiddleware', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      get: jest.fn()
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  it('should pass with valid token', async () => {
    const userId = 'test-user-id';
    const token = jwt.sign({ userId }, process.env.JWT_SECRET);
    mockReq.headers.authorization = `Bearer ${token}`;

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockReq.user).toBeDefined();
  });

  it('should reject with invalid token', async () => {
    mockReq.headers.authorization = 'Bearer invalid-token';

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false
    }));
  });
}); 