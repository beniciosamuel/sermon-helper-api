/**
 * tRPC Authentication Middleware Unit Tests
 *
 * Tests the protectedProcedure authentication middleware
 * Uses mocked repositories to isolate middleware logic
 */

import { TRPCError } from '@trpc/server';
import { router, protectedProcedure, createCallerFactory } from '../../../trpc/trpc';
import { createUserDatabaseEntityFactory, createOauthTokenDatabaseEntityFactory } from '../../utils/factories';
import { User } from '../../../models/entities/User';
import { OauthToken } from '../../../models/entities/OauthToken';

// Mock the repositories
jest.mock('../../../models/repositories/OauthTokenRepository');
jest.mock('../../../models/repositories/UserRepository');

import { OauthTokenRepository } from '../../../models/repositories/OauthTokenRepository';
import { UserRepository } from '../../../models/repositories/UserRepository';

const mockedOauthTokenRepository = OauthTokenRepository as jest.Mocked<typeof OauthTokenRepository>;
const mockedUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;

/**
 * Helper to create a mock OauthToken instance with the correct properties
 */
const createMockOauthToken = (overrides?: Partial<OauthToken>): OauthToken => {
  const entity = createOauthTokenDatabaseEntityFactory(overrides);
  return new OauthToken(entity);
};

describe('tRPC Auth Middleware', () => {
  // Create a simple test router with a protected procedure
  const testRouter = router({
    protectedRoute: protectedProcedure.query(({ ctx }) => {
      return {
        userId: ctx.user.id,
        userName: ctx.user.full_name,
        userEmail: ctx.user.email,
      };
    }),
  });

  const createCaller = createCallerFactory(testRouter);

  // Helper to create mock context with authorization header
  const createMockContext = (authorizationHeader?: string) => ({
    context: {} as any,
    req: {
      headers: {
        authorization: authorizationHeader,
      },
    } as any,
    res: {} as any,
    user: null,
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token extraction', () => {
    it('should reject request without Authorization header', async () => {
      const mockContext = createMockContext();
      const caller = createCaller(mockContext);

      await expect(caller.protectedRoute()).rejects.toThrow(TRPCError);
      await expect(caller.protectedRoute()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
      });
    });

    it('should reject request with empty Authorization header', async () => {
      const mockContext = createMockContext('');
      const caller = createCaller(mockContext);

      await expect(caller.protectedRoute()).rejects.toThrow(TRPCError);
      await expect(caller.protectedRoute()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
      });
    });

    it('should reject request with invalid Authorization format (no Bearer prefix)', async () => {
      const mockContext = createMockContext('InvalidToken123');
      const caller = createCaller(mockContext);

      await expect(caller.protectedRoute()).rejects.toThrow(TRPCError);
      await expect(caller.protectedRoute()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
      });
    });

    it('should reject request with invalid Authorization format (Basic instead of Bearer)', async () => {
      const mockContext = createMockContext('Basic dXNlcjpwYXNz');
      const caller = createCaller(mockContext);

      await expect(caller.protectedRoute()).rejects.toThrow(TRPCError);
      await expect(caller.protectedRoute()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
      });
    });

    it('should reject request with Bearer but no token', async () => {
      const mockContext = createMockContext('Bearer ');
      const caller = createCaller(mockContext);

      await expect(caller.protectedRoute()).rejects.toThrow(TRPCError);
      await expect(caller.protectedRoute()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
      });
    });

    it('should reject request with multiple spaces in Authorization header', async () => {
      const mockContext = createMockContext('Bearer token extra');
      const caller = createCaller(mockContext);

      await expect(caller.protectedRoute()).rejects.toThrow(TRPCError);
      await expect(caller.protectedRoute()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Missing or invalid Authorization header',
      });
    });

    it('should accept lowercase "bearer" prefix', async () => {
      const mockContext = createMockContext('bearer valid-token');
      const caller = createCaller(mockContext);

      const mockToken = createMockOauthToken({
        oauth_token: 'valid-token',
        user_id: 1,
      });
      const userEntity = createUserDatabaseEntityFactory({ id: 1 });

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(mockToken as any);
      mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

      const result = await caller.protectedRoute();

      expect(result.userId).toBe(1);
    });
  });

  describe('Token validation', () => {
    it('should reject request with invalid/non-existent token', async () => {
      const mockContext = createMockContext('Bearer invalid-token');
      const caller = createCaller(mockContext);

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(null);

      await expect(caller.protectedRoute()).rejects.toThrow(TRPCError);
      await expect(caller.protectedRoute()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      });

      expect(mockedOauthTokenRepository.findByOauthToken).toHaveBeenCalledWith(
        'invalid-token',
        mockContext.context
      );
    });

    it('should reject request when user associated with token does not exist', async () => {
      const mockContext = createMockContext('Bearer valid-token');
      const caller = createCaller(mockContext);

      const mockToken = createMockOauthToken({
        oauth_token: 'valid-token',
        user_id: 999,
      });

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(mockToken as any);
      mockedUserRepository.findById.mockResolvedValue(null);

      await expect(caller.protectedRoute()).rejects.toThrow(TRPCError);
      await expect(caller.protectedRoute()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'User not found',
      });

      expect(mockedUserRepository.findById).toHaveBeenCalledWith(999, mockContext.context);
    });
  });

  describe('Successful authentication', () => {
    it('should authenticate request with valid Bearer token', async () => {
      const mockContext = createMockContext('Bearer valid-token-123');
      const caller = createCaller(mockContext);

      const mockToken = createMockOauthToken({
        oauth_token: 'valid-token-123',
        user_id: 42,
      });
      const userEntity = createUserDatabaseEntityFactory({
        id: 42,
        full_name: 'John Doe',
        email: 'john@example.com',
      });

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(mockToken as any);
      mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

      const result = await caller.protectedRoute();

      expect(result).toEqual({
        userId: 42,
        userName: 'John Doe',
        userEmail: 'john@example.com',
      });

      expect(mockedOauthTokenRepository.findByOauthToken).toHaveBeenCalledWith(
        'valid-token-123',
        mockContext.context
      );
      expect(mockedUserRepository.findById).toHaveBeenCalledWith(42, mockContext.context);
    });

    it('should inject user into context for protected procedures', async () => {
      const mockContext = createMockContext('Bearer test-token');
      const caller = createCaller(mockContext);

      const mockToken = createMockOauthToken({
        oauth_token: 'test-token',
        user_id: 1,
      });
      const userEntity = createUserDatabaseEntityFactory({
        id: 1,
        full_name: 'Test User',
        email: 'test@example.com',
        phone: '+1234567890',
        color_theme: 'dark',
        lang: 'pt',
      });

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(mockToken as any);
      mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

      const result = await caller.protectedRoute();

      // Verify the user data is accessible in the procedure
      expect(result.userId).toBe(1);
      expect(result.userName).toBe('Test User');
      expect(result.userEmail).toBe('test@example.com');
    });
  });

  describe('Edge cases', () => {
    it('should handle tokens with special characters', async () => {
      const specialToken = 'abc123_-def456.xyz';
      const mockContext = createMockContext(`Bearer ${specialToken}`);
      const caller = createCaller(mockContext);

      const mockToken = createMockOauthToken({
        oauth_token: specialToken,
        user_id: 1,
      });
      const userEntity = createUserDatabaseEntityFactory({ id: 1 });

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(mockToken as any);
      mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

      const result = await caller.protectedRoute();

      expect(result.userId).toBe(1);
      expect(mockedOauthTokenRepository.findByOauthToken).toHaveBeenCalledWith(
        specialToken,
        mockContext.context
      );
    });

    it('should handle long tokens', async () => {
      const longToken = 'a'.repeat(256);
      const mockContext = createMockContext(`Bearer ${longToken}`);
      const caller = createCaller(mockContext);

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(null);

      await expect(caller.protectedRoute()).rejects.toMatchObject({
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token',
      });

      expect(mockedOauthTokenRepository.findByOauthToken).toHaveBeenCalledWith(
        longToken,
        mockContext.context
      );
    });
  });
});
