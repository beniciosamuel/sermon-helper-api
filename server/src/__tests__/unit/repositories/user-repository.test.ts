import { UserRepository } from '../../../models/repositories/UserRepository';
import { User, UserDatabaseEntity } from '../../../models/entities/User';
import { Context } from '../../../services/Context';

describe('UserRepository', () => {
  // Mock user data matching UserDatabaseEntity
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

  // Helper to create mock context with chainable knex methods
  const createMockContext = () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      whereNull: jest.fn().mockReturnThis(),
      orWhere: jest.fn().mockReturnThis(),
      first: jest.fn(),
      into: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      update: jest.fn(),
    };

    // Create insert mock that returns the query builder
    const mockInsert = jest.fn().mockReturnValue(mockQueryBuilder);

    // Make the db callable (for db('table')) and have insert method
    const mockDb = Object.assign(jest.fn().mockReturnValue(mockQueryBuilder), {
      insert: mockInsert,
    });

    const mockPassword = {
      encrypt: jest.fn().mockResolvedValue('$argon2id$newHashedPassword'),
      verify: jest.fn(),
    };

    return {
      context: {
        db: mockDb,
        password: mockPassword,
        email: null,
        secrets: {},
      } as unknown as Context,
      mockQueryBuilder,
      mockPassword,
      mockDb,
      mockInsert,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create user with hashed password and return User instance', async () => {
      // Arrange
      const { context, mockQueryBuilder, mockPassword, mockInsert } = createMockContext();
      const createArgs = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password: 'plainPassword123',
        color_theme: 'light',
        language: 'en',
      };
      mockQueryBuilder.returning.mockResolvedValue([mockUserData]);

      // Act
      const result = await UserRepository.create(createArgs, context);

      // Assert
      expect(mockPassword.encrypt).toHaveBeenCalledWith('plainPassword123');
      expect(mockInsert).toHaveBeenCalledWith({
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        password_hash: '$argon2id$newHashedPassword',
        color_theme: 'light',
        lang: 'en',
      });
      expect(mockQueryBuilder.into).toHaveBeenCalledWith('users');
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith('*');
      expect(result).toBeInstanceOf(User);
      expect(result.id).toBe(1);
      expect(result.email).toBe('john@example.com');
    });
  });

  describe('update', () => {
    it('should update user fields without password change', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      const user = new User(mockUserData);
      const userRepository = Object.assign(new UserRepository(mockUserData), user);

      const updateArgs = {
        full_name: 'Jane Doe',
        email: 'jane@example.com',
      };
      mockQueryBuilder.update.mockResolvedValue(1);

      // Act
      const result = await userRepository.update(updateArgs, context);

      // Assert
      expect(result).toBe(true);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', 1);
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });

    it('should update user with password re-hashing when password provided', async () => {
      // Arrange
      const { context, mockQueryBuilder, mockPassword } = createMockContext();
      const user = new User(mockUserData);
      const userRepository = Object.assign(new UserRepository(mockUserData), user);

      const updateArgs = {
        full_name: 'Jane Doe',
        password: 'newPassword123',
      };
      mockQueryBuilder.update.mockResolvedValue(1);

      // Act
      const result = await userRepository.update(updateArgs, context);

      // Assert
      expect(result).toBe(true);
      expect(mockPassword.encrypt).toHaveBeenCalledWith('newPassword123');
    });

    it('should return false when user not found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      const user = new User(mockUserData);
      const userRepository = Object.assign(new UserRepository(mockUserData), user);

      const updateArgs = { full_name: 'Jane Doe' };
      mockQueryBuilder.update.mockResolvedValue(0);

      // Act
      const result = await userRepository.update(updateArgs, context);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('delete', () => {
    it('should soft delete user by setting deleted_at', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      const user = new User(mockUserData);
      const userRepository = Object.assign(new UserRepository(mockUserData), user);
      mockQueryBuilder.update.mockResolvedValue(1);

      // Act
      const result = await userRepository.delete(context);

      // Assert
      expect(result).toBe(true);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', 1);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_at: expect.any(String),
        })
      );
    });

    it('should return false when user not found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      const user = new User(mockUserData);
      const userRepository = Object.assign(new UserRepository(mockUserData), user);
      mockQueryBuilder.update.mockResolvedValue(0);

      // Act
      const result = await userRepository.delete(context);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('should return User when found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(mockUserData);

      // Act
      const result = await UserRepository.findById(1, context);

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe(1);
      expect(result?.email).toBe('john@example.com');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', 1);
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });

    it('should return null when user not found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      const result = await UserRepository.findById(999, context);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when user is soft deleted', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(undefined); // whereNull filters out deleted

      // Act
      const result = await UserRepository.findById(1, context);

      // Assert
      expect(result).toBeNull();
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });
  });

  describe('findByEmailOrPhone', () => {
    it('should return User when found by email', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(mockUserData);

      // Act
      const result = await UserRepository.findByEmailOrPhone(
        'john@example.com',
        '+0000000000',
        context
      );

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('john@example.com');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('email', 'john@example.com');
      expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith('phone', '+0000000000');
    });

    it('should return User when found by phone', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(mockUserData);

      // Act
      const result = await UserRepository.findByEmailOrPhone(
        'other@example.com',
        '+1234567890',
        context
      );

      // Assert
      expect(result).toBeInstanceOf(User);
      expect(result?.phone).toBe('+1234567890');
    });

    it('should return null when user not found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      const result = await UserRepository.findByEmailOrPhone(
        'notfound@example.com',
        '+0000000000',
        context
      );

      // Assert
      expect(result).toBeNull();
    });

    it('should exclude soft deleted users', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      await UserRepository.findByEmailOrPhone('john@example.com', '+1234567890', context);

      // Assert
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });
  });
});
