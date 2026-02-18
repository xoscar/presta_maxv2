/**
 * Authentication utility tests
 *
 * These tests verify the JWT token creation and verification functions.
 * Note: For full integration tests, a MongoDB test database would be needed.
 */

// Mock next/server before importing auth
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn().mockImplementation((data, init) => ({ data, ...init })),
  },
}));

// Mock next/headers before importing auth
jest.mock('next/headers', () => ({
  cookies: jest.fn().mockResolvedValue({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

// Mock the user service
jest.mock('@/lib/services/user.service', () => ({
  userService: {
    validateToken: jest.fn(),
  },
}));

import { createToken, verifyToken } from '@/lib/auth';

// Mock jose module for testing
jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation(() => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockResolvedValue('mock-jwt-token'),
  })),
  jwtVerify: jest.fn().mockImplementation(async (token) => {
    if (token === 'valid-token') {
      return {
        payload: {
          username: 'testuser',
          userId: '123',
          token: 'usertoken',
        },
      };
    }
    throw new Error('Invalid token');
  }),
}));

describe('Auth utilities', () => {
  describe('createToken', () => {
    it('creates a token with correct prefix', async () => {
      const payload = {
        username: 'testuser',
        userId: '123',
        token: 'usertoken',
      };

      const token = await createToken(payload);
      expect(token).toMatch(/^token /);
    });
  });

  describe('verifyToken', () => {
    it('verifies a valid token', async () => {
      const payload = await verifyToken('token valid-token');
      expect(payload).toEqual({
        username: 'testuser',
        userId: '123',
        token: 'usertoken',
      });
    });

    it('returns null for invalid token', async () => {
      const payload = await verifyToken('invalid');
      expect(payload).toBeNull();
    });

    it('handles token without prefix', async () => {
      const payload = await verifyToken('valid-token');
      expect(payload).not.toBeNull();
    });
  });
});
