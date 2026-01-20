/**
 * findUserById Use Case Unit Tests
 *
 * Tests the findUserById use case which fetches a user by their ID
 * Uses mocked UserRepository to isolate use case logic
 */

import { findUserById } from '../../../useCases/findUserById';
import { UserRepository } from '../../../models/repositories/UserRepository';
import { User, UserDatabaseEntity } from '../../../models/entities/User';
import { Context } from '../../../services/Context';

// Mock UserRepository module
jest.mock('../../../models/repositories/UserRepository');

const MockedUserRepository = jest.mocked(UserRepository);

describe('findUserById', () => {
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
    it('should return success with user when user is found', async () => {
      // Arrange
      MockedUserRepository.findById.mockResolvedValue(mockUser);

      // Act
      const result = await findUserById(1, mockContext);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBe(mockUser);
      expect(result.error).toBeUndefined();
      expect(MockedUserRepository.findById).toHaveBeenCalledWith(1, mockContext);
    });

    it('should return success with undefined user when user is not found', async () => {
      // Arrange
      MockedUserRepository.findById.mockResolvedValue(null);

      // Act
      const result = await findUserById(999, mockContext);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeUndefined();
      expect(result.error).toBeUndefined();
      expect(MockedUserRepository.findById).toHaveBeenCalledWith(999, mockContext);
    });

    it('should pass the correct ID to the repository', async () => {
      // Arrange
      MockedUserRepository.findById.mockResolvedValue(null);

      // Act
      await findUserById(42, mockContext);

      // Assert
      expect(MockedUserRepository.findById).toHaveBeenCalledWith(42, mockContext);
    });
  });

  describe('error handling', () => {
    it('should return error with message when Error is thrown', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      MockedUserRepository.findById.mockRejectedValue(dbError);

      // Act
      const result = await findUserById(1, mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.user).toBeUndefined();
    });

    it('should return "Unknown error" when non-Error is thrown', async () => {
      // Arrange
      MockedUserRepository.findById.mockRejectedValue('string error');

      // Act
      const result = await findUserById(1, mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
      expect(result.user).toBeUndefined();
    });

    it('should log error to console when error occurs', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      MockedUserRepository.findById.mockRejectedValue(dbError);

      // Act
      await findUserById(1, mockContext);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error finding user by id', dbError);
    });

    it('should handle null rejection', async () => {
      // Arrange
      MockedUserRepository.findById.mockRejectedValue(null);

      // Act
      const result = await findUserById(1, mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });

    it('should handle undefined rejection', async () => {
      // Arrange
      MockedUserRepository.findById.mockRejectedValue(undefined);

      // Act
      const result = await findUserById(1, mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Unknown error');
    });
  });
});
