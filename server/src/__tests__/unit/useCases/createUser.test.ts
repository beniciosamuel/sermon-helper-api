import { createUser } from '../../../useCases/createUser';
import { UserRepository } from '../../../models/repositories/UserRepository';
import { User, UserDatabaseEntity } from '../../../models/entities/User';
import { Context } from '../../../services/Context';

// Mock UserRepository module
jest.mock('../../../models/repositories/UserRepository');

const MockedUserRepository = jest.mocked(UserRepository);

describe('createUser', () => {
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

  const createArgs = {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    password: 'plainPassword123',
    color_theme: 'light',
    language: 'en',
  };

  const mockContext = {} as Context;

  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('successful user creation', () => {
    it('should return success with user when no existing user', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(null);
      MockedUserRepository.create.mockResolvedValue(mockUser);

      // Act
      const result = await createUser(createArgs, mockContext);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBe(mockUser);
      expect(result.error).toBeUndefined();
      expect(MockedUserRepository.findByEmailOrPhone).toHaveBeenCalledWith(
        createArgs.email,
        createArgs.phone,
        mockContext
      );
      expect(MockedUserRepository.create).toHaveBeenCalledWith(createArgs, mockContext);
    });
  });

  describe('duplicate user handling', () => {
    it('should return error when user with email already exists', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(mockUser);

      // Act
      const result = await createUser(createArgs, mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User already exists');
      expect(result.user).toBeUndefined();
      expect(MockedUserRepository.create).not.toHaveBeenCalled();
    });

    it('should return error when user with phone already exists', async () => {
      // Arrange
      const existingUserWithPhone = new User({
        ...mockUserData,
        email: 'different@example.com',
      });
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(existingUserWithPhone);

      // Act
      const result = await createUser(createArgs, mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('User already exists');
      expect(result.user).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should return error with message when Error is thrown', async () => {
      // Arrange
      const dbError = new Error('Database connection failed');
      MockedUserRepository.findByEmailOrPhone.mockRejectedValue(dbError);

      // Act
      const result = await createUser(createArgs, mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.user).toBeUndefined();
    });

    it('should return "Unknown error" when non-Error is thrown', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockRejectedValue('string error');

      // Act
      const result = await createUser(createArgs, mockContext);

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
      await createUser(createArgs, mockContext);

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating user', dbError);
    });

    it('should return error when UserRepository.create fails', async () => {
      // Arrange
      MockedUserRepository.findByEmailOrPhone.mockResolvedValue(null);
      MockedUserRepository.create.mockRejectedValue(new Error('Insert failed'));

      // Act
      const result = await createUser(createArgs, mockContext);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Insert failed');
      expect(result.user).toBeUndefined();
    });
  });
});
