const { authMiddleware } = require('../auth.middleware');
const { createTestUser } = require('../../../tests/helpers');

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
    const { token } = await createTestUser();
    mockReq.headers.authorization = `Bearer ${token}`;

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockReq).toHaveProperty('user');
    expect(mockNext).toHaveBeenCalled();
    expect(mockRes.status).not.toHaveBeenCalled();
  });

  it('should reject with invalid token', async () => {
    mockReq.headers.authorization = 'Bearer invalid-token';

    await authMiddleware(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });
}); 