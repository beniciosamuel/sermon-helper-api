/**
 * Express Authentication Middleware Unit Tests
 *
 * Tests the authMiddleware and createAuthMiddleware functions
 * Uses mocked repositories and Express request/response objects
 */

import { Request, Response, NextFunction } from 'express';
import { authMiddleware, createAuthMiddleware, AuthenticatedRequest } from '../../../middlewares/auth';
import { createUserDatabaseEntityFactory, createOauthTokenDatabaseEntityFactory } from '../../utils/factories';
import { User } from '../../../models/entities/User';
import { OauthTokenRepository } from '../../../models/repositories/OauthTokenRepository';
import { Context } from '../../../services/Context';

// Mock the repositories
jest.mock('../../../models/repositories/OauthTokenRepository');
jest.mock('../../../models/repositories/UserRepository');
jest.mock('../../../services/Context');

import { UserRepository } from '../../../models/repositories/UserRepository';

const mockedOauthTokenRepository = OauthTokenRepository as jest.Mocked<typeof OauthTokenRepository>;
const mockedUserRepository = UserRepository as jest.Mocked<typeof UserRepository>;
const mockedContext = Context as jest.Mocked<typeof Context>;

describe('Express Auth Middleware', () => {
  // Mock Express request, response, and next function
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset request mock
    mockRequest = {
      headers: {},
    };

    // Setup response mock with chainable methods
    mockJson = jest.fn();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });
    mockResponse = {
      status: mockStatus,
      json: mockJson,
    };

    mockNext = jest.fn();

    // Mock Context.initialize
    mockedContext.initialize.mockResolvedValue({} as Context);
  });

  describe('authMiddleware', () => {
    describe('Token extraction', () => {
      it('should return 401 without Authorization header', async () => {
        mockRequest.headers = {};

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 with empty Authorization header', async () => {
        mockRequest.headers = { authorization: '' };

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 with invalid Authorization format (no Bearer prefix)', async () => {
        mockRequest.headers = { authorization: 'InvalidToken123' };

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 with Basic auth instead of Bearer', async () => {
        mockRequest.headers = { authorization: 'Basic dXNlcjpwYXNz' };

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 with Bearer but no token', async () => {
        mockRequest.headers = { authorization: 'Bearer ' };

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 with multiple spaces in Authorization header', async () => {
        mockRequest.headers = { authorization: 'Bearer token extra' };

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should accept lowercase "bearer" prefix', async () => {
        mockRequest.headers = { authorization: 'bearer valid-token' };

        const tokenEntity = createOauthTokenDatabaseEntityFactory({
          oauth_token: 'valid-token',
          user_id: 1,
        });
        const userEntity = createUserDatabaseEntityFactory({ id: 1 });

        mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(
          new OauthTokenRepository(tokenEntity) as any
        );
        mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
      });
    });

    describe('Token validation', () => {
      it('should return 401 with invalid/non-existent token', async () => {
        mockRequest.headers = { authorization: 'Bearer invalid-token' };

        mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(null);

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });

      it('should return 401 when user associated with token does not exist', async () => {
        mockRequest.headers = { authorization: 'Bearer valid-token' };

        const tokenEntity = createOauthTokenDatabaseEntityFactory({
          oauth_token: 'valid-token',
          user_id: 999,
        });

        mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(
          new OauthTokenRepository(tokenEntity) as any
        );
        mockedUserRepository.findById.mockResolvedValue(null);

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockStatus).toHaveBeenCalledWith(401);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Unauthorized',
          message: 'User not found',
        });
        expect(mockNext).not.toHaveBeenCalled();
      });
    });

    describe('Successful authentication', () => {
      it('should call next() with valid Bearer token', async () => {
        mockRequest.headers = { authorization: 'Bearer valid-token-123' };

        const tokenEntity = createOauthTokenDatabaseEntityFactory({
          oauth_token: 'valid-token-123',
          user_id: 42,
        });
        const userEntity = createUserDatabaseEntityFactory({
          id: 42,
          full_name: 'John Doe',
          email: 'john@example.com',
        });

        mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(
          new OauthTokenRepository(tokenEntity) as any
        );
        mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockNext).toHaveBeenCalled();
        expect(mockStatus).not.toHaveBeenCalled();
      });

      it('should inject user into request object', async () => {
        mockRequest.headers = { authorization: 'Bearer test-token' };

        const tokenEntity = createOauthTokenDatabaseEntityFactory({
          oauth_token: 'test-token',
          user_id: 1,
        });
        const userEntity = createUserDatabaseEntityFactory({
          id: 1,
          full_name: 'Test User',
          email: 'test@example.com',
        });

        mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(
          new OauthTokenRepository(tokenEntity) as any
        );
        mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const authenticatedRequest = mockRequest as AuthenticatedRequest;
        expect(authenticatedRequest.user).toBeDefined();
        expect(authenticatedRequest.user.id).toBe(1);
        expect(authenticatedRequest.user.full_name).toBe('Test User');
        expect(authenticatedRequest.user.email).toBe('test@example.com');
      });

      it('should inject context into request object', async () => {
        mockRequest.headers = { authorization: 'Bearer test-token' };

        const mockContextInstance = { db: {}, email: {} } as unknown as Context;
        mockedContext.initialize.mockResolvedValue(mockContextInstance);

        const tokenEntity = createOauthTokenDatabaseEntityFactory({
          oauth_token: 'test-token',
          user_id: 1,
        });
        const userEntity = createUserDatabaseEntityFactory({ id: 1 });

        mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(
          new OauthTokenRepository(tokenEntity) as any
        );
        mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        const authenticatedRequest = mockRequest as AuthenticatedRequest;
        expect(authenticatedRequest.context).toBeDefined();
      });
    });

    describe('Error handling', () => {
      it('should return 500 when an unexpected error occurs', async () => {
        mockRequest.headers = { authorization: 'Bearer valid-token' };

        mockedOauthTokenRepository.findByOauthToken.mockRejectedValue(
          new Error('Database connection failed')
        );

        // Suppress console.error for this test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

        await authMiddleware(
          mockRequest as Request,
          mockResponse as Response,
          mockNext
        );

        expect(mockStatus).toHaveBeenCalledWith(500);
        expect(mockJson).toHaveBeenCalledWith({
          error: 'Internal Server Error',
          message: 'Authentication failed due to an internal error',
        });
        expect(mockNext).not.toHaveBeenCalled();

        consoleSpy.mockRestore();
      });
    });
  });

  describe('createAuthMiddleware', () => {
    it('should create middleware with custom context', async () => {
      const customContext = { db: {}, email: {} } as unknown as Context;
      const customMiddleware = createAuthMiddleware(customContext);

      mockRequest.headers = { authorization: 'Bearer test-token' };

      const tokenEntity = createOauthTokenDatabaseEntityFactory({
        oauth_token: 'test-token',
        user_id: 1,
      });
      const userEntity = createUserDatabaseEntityFactory({ id: 1 });

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(
        new OauthTokenRepository(tokenEntity) as any
      );
      mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

      await customMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockedOauthTokenRepository.findByOauthToken).toHaveBeenCalledWith(
        'test-token',
        customContext
      );
    });

    it('should return 401 without Authorization header', async () => {
      const customContext = {} as Context;
      const customMiddleware = createAuthMiddleware(customContext);

      mockRequest.headers = {};

      await customMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 with invalid token', async () => {
      const customContext = {} as Context;
      const customMiddleware = createAuthMiddleware(customContext);

      mockRequest.headers = { authorization: 'Bearer invalid-token' };
      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(null);

      await customMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when user not found', async () => {
      const customContext = {} as Context;
      const customMiddleware = createAuthMiddleware(customContext);

      mockRequest.headers = { authorization: 'Bearer valid-token' };

      const tokenEntity = createOauthTokenDatabaseEntityFactory({
        oauth_token: 'valid-token',
        user_id: 999,
      });

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(
        new OauthTokenRepository(tokenEntity) as any
      );
      mockedUserRepository.findById.mockResolvedValue(null);

      await customMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Unauthorized',
        message: 'User not found',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 500 on unexpected error', async () => {
      const customContext = {} as Context;
      const customMiddleware = createAuthMiddleware(customContext);

      mockRequest.headers = { authorization: 'Bearer valid-token' };
      mockedOauthTokenRepository.findByOauthToken.mockRejectedValue(
        new Error('Unexpected error')
      );

      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await customMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: 'Internal Server Error',
        message: 'Authentication failed due to an internal error',
      });
      expect(mockNext).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('Edge cases', () => {
    it('should handle tokens with special characters', async () => {
      const specialToken = 'abc123_-def456.xyz';
      mockRequest.headers = { authorization: `Bearer ${specialToken}` };

      const tokenEntity = createOauthTokenDatabaseEntityFactory({
        oauth_token: specialToken,
        user_id: 1,
      });
      const userEntity = createUserDatabaseEntityFactory({ id: 1 });

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(
        new OauthTokenRepository(tokenEntity) as any
      );
      mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockedOauthTokenRepository.findByOauthToken).toHaveBeenCalledWith(
        specialToken,
        expect.anything()
      );
    });

    it('should handle long tokens', async () => {
      const longToken = 'a'.repeat(256);
      mockRequest.headers = { authorization: `Bearer ${longToken}` };

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(null);

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockedOauthTokenRepository.findByOauthToken).toHaveBeenCalledWith(
        longToken,
        expect.anything()
      );
    });

    it('should handle mixed case Bearer prefix', async () => {
      mockRequest.headers = { authorization: 'BEARER valid-token' };

      const tokenEntity = createOauthTokenDatabaseEntityFactory({
        oauth_token: 'valid-token',
        user_id: 1,
      });
      const userEntity = createUserDatabaseEntityFactory({ id: 1 });

      mockedOauthTokenRepository.findByOauthToken.mockResolvedValue(
        new OauthTokenRepository(tokenEntity) as any
      );
      mockedUserRepository.findById.mockResolvedValue(new User(userEntity));

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
