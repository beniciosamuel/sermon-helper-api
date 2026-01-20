/**
 * findUserByEmailOrPhone Use Case Unit Tests
 *
 * Tests the findUserByEmailOrPhone use case which fetches a user by email or phone
 * Uses mocked UserRepository to isolate use case logic
 */

import { findUserByEmailOrPhone } from '../../../useCases/findUserByEmailOrPhone';
import { UserRepository } from '../../../models/repositories/UserRepository';
import { User, UserDatabaseEntity } from '../../../models/entities/User';
import { Context } from '../../../services/Context';

// Mock UserRepository module
jest.mock('../../../models/repositories/UserRepository');

const MockedUserRepository = jest.mocked(UserRepository);

describe('findUserByEmailOrPhone', () => {
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
  const mockContext = {} as Context;

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('successful user lookup', () => {
    it('should return success with user when found by email', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(mockUser);

      // Act
      const result = await findUserByEmailOrPhone('john@example.com', '+0000000000', mockContext);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBe(mockUser);
      expect(result.error).toBeUndefined();
      expect(MockedUserRepository.findByEmailOrPhone).toHaveBeenCalledWith(
        'john@example.com',
        '+0000000000',
        mockContext
      );
    });

    it('should return success with user when found by phone', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(mockUser);

      // Act
      const result = await findUserByEmailOrPhone(
        'different@example.com',
        '+1234567890',
        mockContext
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBe(mockUser);
      expect(result.error).toBeUndefined();
      expect(MockedUserRepository.findByEmailOrPhone).toHaveBeenCalledWith(
        'different@example.com',
        '+1234567890',
        mockContext
      );
    });

    it('should return success with undefined user when user is not found', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(null);

      // Act
      const result = await findUserByEmailOrPhone(
        'notfound@example.com',
        '+9999999999',
        mockContext
      );

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeUndefined();
      expect(result.error).toBeUndefined();
      expect(MockedUserRepository.findByEmailOrPhone).toHaveBeenCalledWith(
        'notfound@example.com',
        '+9999999999',
        mockContext
      );
    });

    it('should pass both email and phone to the repository', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(null);

      // Act
      await findUserByEmailOrPhone('test@example.com', '+5551234567', mockContext);

      // Assert
      expect(MockedUserRepository.findByEmailOrPhone).toHaveBeenCalledWith(
        'test@example.com',
        '+5551234567',
        mockContext
      );
    });
  });

  describe('error handling', () => {
    it('should return error with message when Error is thrown', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      MockedUserRepository.findByEmailOrPhone.mockRejectedValue(dbError);

      // Act
      const result = await findUserByEmailOrPhone('test@example.com', '+1234567890', mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.user).toBeUndefined();
    });

    it('should return "Unknown error" when non-Error is thrown', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockRejectedValue('string error');

      // Act
      const result = await findUserByEmailOrPhone('test@example.com', '+1234567890', mockContext);

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
      await findUserByEmailOrPhone('test@example.com', '+1234567890', mockContext);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error finding user by email or phone', dbError);
    });

    it('should handle null rejection', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockRejectedValue(null);

      // Act
      const result = await findUserByEmailOrPhone('test@example.com', '+1234567890', mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should handle undefined rejection', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockRejectedValue(undefined);

      // Act
      const result = await findUserByEmailOrPhone('test@example.com', '+1234567890', mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should handle object rejection without message', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockRejectedValue({ code: 'ECONNREFUSED' });

      // Act
      const result = await findUserByEmailOrPhone('test@example.com', '+1234567890', mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });
});
