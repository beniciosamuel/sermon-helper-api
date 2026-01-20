import { authenticate } from '../../../useCases/authenticate';
import { UserRepository } from '../../../models/repositories/UserRepository';
import { OauthTokenRepository } from '../../../models/repositories/OauthTokenRepository';
import { User, UserDatabaseEntity } from '../../../models/entities/User';
import { Context } from '../../../services/Context';

// Mock UserRepository module
jest.mock('../../../models/repositories/UserRepository');
jest.mock('../../../models/repositories/OauthTokenRepository');

const MockedUserRepository = jest.mocked(UserRepository);
const MockedOauthTokenRepository = jest.mocked(OauthTokenRepository);

describe('authenticate', () => {
  // Mock user data
  const mockUserData: UserDatabaseEntity = {
    id: 1,
    full_name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    password_hash: '$argon2id$hashedPassword',
    color_theme: 'light',
    lang: 'en',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    deleted_at: null,
  };

  const mockUser = new User(mockUserData);

  const authenticateArgs = {
    email: 'john@example.com',
    phone: '+1234567890',
    password: 'plainPassword123',
  };

  const mockPassword = {
    encrypt: jest.fn(),
    verify: jest.fn(),
  };

  const mockContext = {
    password: mockPassword,
  } as unknown as Context;

  const mockOauthToken = {
    id: 1,
    user_id: 1,
    oauth_token: 'mock-oauth-token-12345',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    deleted_at: null,
    regenerate: jest.fn(),
  };

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('successful authentication', () => {
    it('should return success with user and token when credentials are valid and token exists', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(mockUser);
      mockPassword.verify.mockResolvedValue(true);
      MockedOauthTokenRepository.findByUserId.mockResolvedValue(mockOauthToken as any);
      mockOauthToken.regenerate.mockResolvedValue(true);

      // Act
      const result = await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBe(mockUser);
      expect(result.oauthToken).toBe(mockOauthToken.oauth_token);
      expect(result.error).toBeUndefined();
      expect(MockedUserRepository.findByEmailOrPhone).toHaveBeenCalledWith(
        authenticateArgs.email,
        authenticateArgs.phone,
        mockContext
      );
      expect(mockPassword.verify).toHaveBeenCalledWith(
        mockUser.password_hash,
        authenticateArgs.password
      );
      expect(mockOauthToken.regenerate).toHaveBeenCalledWith(mockContext);
    });

    it('should create new token when no existing token found', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(mockUser);
      mockPassword.verify.mockResolvedValue(true);
      MockedOauthTokenRepository.findByUserId.mockResolvedValue(null);
      MockedOauthTokenRepository.create.mockResolvedValue(mockOauthToken as any);

      // Act
      const result = await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBe(mockUser);
      expect(result.oauthToken).toBe(mockOauthToken.oauth_token);
      expect(MockedOauthTokenRepository.create).toHaveBeenCalledWith(mockUser.id, mockContext);
      expect(mockOauthToken.regenerate).not.toHaveBeenCalled();
    });
  });

  describe('authentication failure - user not found', () => {
    it('should return error when user is not found', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(null);

      // Act
      const result = await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User not found');
      expect(result.user).toBeUndefined();
      expect(result.oauthToken).toBeUndefined();
      expect(mockPassword.verify).not.toHaveBeenCalled();
    });
  });

  describe('authentication failure - invalid password', () => {
    it('should return error when password is invalid', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(mockUser);
      mockPassword.verify.mockResolvedValue(false);

      // Act
      const result = await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid password');
      expect(result.user).toBeUndefined();
      expect(result.oauthToken).toBeUndefined();
      expect(MockedOauthTokenRepository.findByUserId).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should return error with message when Error is thrown from findByEmailOrPhone', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      MockedUserRepository.findByEmailOrPhone.mockRejectedValue(dbError);

      // Act
      const result = await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.user).toBeUndefined();
    });

    it('should return error with message when Error is thrown from password verification', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(mockUser);
      mockPassword.verify.mockRejectedValue(new Error('Verification error'));

      // Act
      const result = await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Verification error');
    });

    it('should return error with message when Error is thrown from token operations', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(mockUser);
      mockPassword.verify.mockResolvedValue(true);
      MockedOauthTokenRepository.findByUserId.mockRejectedValue(new Error('Token lookup failed'));

      // Act
      const result = await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Token lookup failed');
    });

    it('should return "Unknown error" when non-Error is thrown', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockRejectedValue('string error');

      // Act
      const result = await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
      expect(result.user).toBeUndefined();
    });

    it('should log error to console when error occurs', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      MockedUserRepository.findByEmailOrPhone.mockRejectedValue(dbError);

      // Act
      await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error authenticating user', dbError);
    });

    it('should return error when token regeneration fails', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(mockUser);
      mockPassword.verify.mockResolvedValue(true);
      MockedOauthTokenRepository.findByUserId.mockResolvedValue(mockOauthToken as any);
      mockOauthToken.regenerate.mockRejectedValue(new Error('Regeneration failed'));

      // Act
      const result = await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Regeneration failed');
    });

    it('should return error when token creation fails', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(mockUser);
      mockPassword.verify.mockResolvedValue(true);
      MockedOauthTokenRepository.findByUserId.mockResolvedValue(null);
      MockedOauthTokenRepository.create.mockRejectedValue(new Error('Token creation failed'));

      // Act
      const result = await authenticate({ ...authenticateArgs, context: mockContext });

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Token creation failed');
    });
  });
});
