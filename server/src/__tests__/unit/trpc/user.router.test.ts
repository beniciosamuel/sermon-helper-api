/**
 * User Router Unit Tests
 * 
 * Tests the tRPC user router procedures (create, findById)
 * Uses mocked use cases and repositories to isolate router logic
 */

import { TRPCError } from '@trpc/server';
import { userRouter } from '../../../trpc/routers/user/user.router';
import { createCallerFactory } from '../../../trpc/trpc';
import { createUserDatabaseEntityFactory } from '../../utils/factories';
import { User } from '../../../models/entities/User';
import type { CreateUserInput } from '../../../trpc/schemas';

/**
 * Factory for creating valid tRPC input (matches Zod schema)
 */
const createValidUserInput = (overrides?: Partial<CreateUserInput>): CreateUserInput => ({
  name: 'Test User',
  email: 'test@example.com',
  phone: '+1234567890',
  password: 'password123',
  color_theme: 'light',
  language: 'en',
  ...overrides,
});

// Mock the use cases
jest.mock('../../../useCases', () => ({
  createUser: jest.fn(),
}));

// Mock the repository
jest.mock('../../../models/repositories/UserRepository', () => ({
  UserRepository: {
    findById: jest.fn(),
  },
}));

import { createUser } from '../../../useCases';
import { UserRepository } from '../../../models/repositories/UserRepository';

const mockedCreateUser = createUser as jest.MockedFunction<typeof createUser>;
const mockedFindById = UserRepository.findById as jest.MockedFunction<typeof UserRepository.findById>;

describe('User Router', () => {
  // Create a caller for testing the router
  const createCaller = createCallerFactory(userRouter);
  
  // Mock context
  const mockContext = {
    context: {} as any,
    req: {} as any,
    res: {} as any,
  };

  const caller = createCaller(mockContext);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const input = createValidUserInput();
      const createdUser = new User(createUserDatabaseEntityFactory({
        full_name: input.name,
        email: input.email,
        phone: input.phone,
      }));

      mockedCreateUser.mockResolvedValue({
        success: true,
        user: createdUser,
      });

      const result = await caller.create(input);

      expect(mockedCreateUser).toHaveBeenCalledWith(input, mockContext.context);
      expect(result).toEqual({
        id: createdUser.id,
        full_name: createdUser.full_name,
        email: createdUser.email,
        phone: createdUser.phone,
        color_theme: createdUser.color_theme,
        lang: createdUser.lang,
        created_at: createdUser.created_at,
        updated_at: createdUser.updated_at,
      });
      // Should not contain sensitive data
      expect(result).not.toHaveProperty('password_hash');
      expect(result).not.toHaveProperty('deleted_at');
    });

    it('should throw BAD_REQUEST when user creation fails', async () => {
      const input = createValidUserInput();

      mockedCreateUser.mockResolvedValue({
        success: false,
        error: 'User already exists',
      });

      await expect(caller.create(input)).rejects.toThrow(TRPCError);
      await expect(caller.create(input)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'User already exists',
      });
    });

    it('should throw BAD_REQUEST with default message when error is undefined', async () => {
      const input = createValidUserInput();

      mockedCreateUser.mockResolvedValue({
        success: false,
      });

      await expect(caller.create(input)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Failed to create user',
      });
    });

    it('should validate email format', async () => {
      const input = createValidUserInput({ email: 'invalid-email' });

      await expect(caller.create(input)).rejects.toThrow();
    });

    it('should validate password minimum length', async () => {
      const input = createValidUserInput({ password: 'short' });

      await expect(caller.create(input)).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      await expect(caller.create({} as any)).rejects.toThrow();
    });
  });

  describe('findById', () => {
    it('should find a user by ID successfully', async () => {
      const userEntity = createUserDatabaseEntityFactory({ id: 1 });
      const user = new User(userEntity);

      mockedFindById.mockResolvedValue(user);

      const result = await caller.findById({ id: 1 });

      expect(mockedFindById).toHaveBeenCalledWith(1, mockContext.context);
      expect(result).toEqual({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        color_theme: user.color_theme,
        lang: user.lang,
        created_at: user.created_at,
        updated_at: user.updated_at,
      });
      // Should not contain sensitive data
      expect(result).not.toHaveProperty('password_hash');
      expect(result).not.toHaveProperty('deleted_at');
    });

    it('should throw NOT_FOUND when user does not exist', async () => {
      mockedFindById.mockResolvedValue(null);

      await expect(caller.findById({ id: 999 })).rejects.toThrow(TRPCError);
      await expect(caller.findById({ id: 999 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'User with ID 999 not found',
      });
    });

    it('should validate ID is a positive integer', async () => {
      await expect(caller.findById({ id: -1 })).rejects.toThrow();
      await expect(caller.findById({ id: 0 })).rejects.toThrow();
    });

    it('should validate ID is required', async () => {
      await expect(caller.findById({} as any)).rejects.toThrow();
    });
  });
});
