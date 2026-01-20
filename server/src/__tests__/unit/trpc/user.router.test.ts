/**
 * User Router Unit Tests
 *
 * Tests the tRPC user router procedures (create, findById, findByEmailOrPhone)
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

// Mock all use cases from the index file (where user.router imports them from)
jest.mock('../../../useCases', () => ({
  createUser: jest.fn(),
  findUserById: jest.fn(),
  findUserByEmailOrPhone: jest.fn(),
}));

// Mock the authenticate use case (imported separately in user.router)
jest.mock('../../../useCases/authenticate', () => ({
  authenticate: jest.fn(),
}));

import { createUser, findUserById, findUserByEmailOrPhone } from '../../../useCases';
import { authenticate } from '../../../useCases/authenticate';

const mockedCreateUser = createUser as jest.MockedFunction<typeof createUser>;
const mockedFindUserById = findUserById as jest.MockedFunction<typeof findUserById>;
const mockedFindUserByEmailOrPhone = findUserByEmailOrPhone as jest.MockedFunction<
  typeof findUserByEmailOrPhone
>;
const mockedAuthenticate = authenticate as jest.MockedFunction<typeof authenticate>;

describe('User Router', () => {
  // Create a caller for testing the router
  const createCaller = createCallerFactory(userRouter);

  // Mock context
  const mockContext = {
    context: {} as any,
    req: {} as any,
    res: {} as any,
    user: null,
  };

  const caller = createCaller(mockContext);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      const input = createValidUserInput();
      const createdUser = new User(
        createUserDatabaseEntityFactory({
          full_name: input.name,
          email: input.email,
          phone: input.phone,
        })
      );

      mockedCreateUser.mockResolvedValue({
        success: true,
        user: createdUser,
        oauthToken: 'mock-oauth-token-12345',
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
        oauth_token: 'mock-oauth-token-12345',
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

      mockedFindUserById.mockResolvedValue({
        success: true,
        user: user,
      });

      const result = await caller.findById({ id: 1 });

      expect(mockedFindUserById).toHaveBeenCalledWith(1, mockContext.context);
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
      mockedFindUserById.mockResolvedValue({
        success: true,
        user: undefined,
      });

      await expect(caller.findById({ id: 999 })).rejects.toThrow(TRPCError);
      await expect(caller.findById({ id: 999 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'User with ID 999 not found',
      });
    });

    it('should throw NOT_FOUND when use case fails', async () => {
      mockedFindUserById.mockResolvedValue({
        success: false,
        error: 'Database error',
      });

      await expect(caller.findById({ id: 1 })).rejects.toThrow(TRPCError);
      await expect(caller.findById({ id: 1 })).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Database error',
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

  describe('findByEmailOrPhone', () => {
    it('should find a user by email or phone successfully', async () => {
      const userEntity = createUserDatabaseEntityFactory({
        id: 1,
        email: 'test@example.com',
        phone: '+1234567890',
      });
      const user = new User(userEntity);

      mockedFindUserByEmailOrPhone.mockResolvedValue({
        success: true,
        user: user,
      });

      const result = await caller.findByEmailOrPhone({
        email: 'test@example.com',
        phone: '+1234567890',
      });

      expect(mockedFindUserByEmailOrPhone).toHaveBeenCalledWith(
        'test@example.com',
        '+1234567890',
        mockContext.context
      );
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
      mockedFindUserByEmailOrPhone.mockResolvedValue({
        success: true,
        user: undefined,
      });

      await expect(
        caller.findByEmailOrPhone({
          email: 'notfound@example.com',
          phone: '+9999999999',
        })
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.findByEmailOrPhone({
          email: 'notfound@example.com',
          phone: '+9999999999',
        })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'User with email notfound@example.com or phone +9999999999 not found',
      });
    });

    it('should throw NOT_FOUND when use case fails', async () => {
      mockedFindUserByEmailOrPhone.mockResolvedValue({
        success: false,
        error: 'Database connection failed',
      });

      await expect(
        caller.findByEmailOrPhone({
          email: 'test@example.com',
          phone: '+1234567890',
        })
      ).rejects.toThrow(TRPCError);
      await expect(
        caller.findByEmailOrPhone({
          email: 'test@example.com',
          phone: '+1234567890',
        })
      ).rejects.toMatchObject({
        code: 'NOT_FOUND',
        message: 'Database connection failed',
      });
    });

    it('should validate email format', async () => {
      await expect(
        caller.findByEmailOrPhone({
          email: 'invalid-email',
          phone: '+1234567890',
        })
      ).rejects.toThrow();
    });

    it('should validate phone is required', async () => {
      await expect(
        caller.findByEmailOrPhone({
          email: 'test@example.com',
          phone: '',
        })
      ).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      await expect(caller.findByEmailOrPhone({} as any)).rejects.toThrow();
    });
  });

  describe('authenticate', () => {
    const authenticateInput = {
      email: 'test@example.com',
      phone: '+1234567890',
      password: 'password123',
    };

    it('should authenticate a user successfully', async () => {
      const userEntity = createUserDatabaseEntityFactory({
        id: 1,
        email: 'test@example.com',
        phone: '+1234567890',
      });
      const user = new User(userEntity);

      mockedAuthenticate.mockResolvedValue({
        success: true,
        user: user,
        oauthToken: 'mock-oauth-token-12345',
      });

      const result = await caller.authenticate(authenticateInput);

      expect(mockedAuthenticate).toHaveBeenCalledWith({
        ...authenticateInput,
        context: mockContext.context,
      });
      expect(result).toEqual({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        color_theme: user.color_theme,
        lang: user.lang,
        created_at: user.created_at,
        updated_at: user.updated_at,
        oauthToken: 'mock-oauth-token-12345',
      });
    });

    it('should throw BAD_REQUEST when authentication fails', async () => {
      mockedAuthenticate.mockResolvedValue({
        success: false,
        error: 'Invalid password',
      });

      await expect(caller.authenticate(authenticateInput)).rejects.toThrow(TRPCError);
      await expect(caller.authenticate(authenticateInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Invalid password',
      });
    });

    it('should throw BAD_REQUEST when user not found', async () => {
      mockedAuthenticate.mockResolvedValue({
        success: false,
        error: 'User not found',
      });

      await expect(caller.authenticate(authenticateInput)).rejects.toThrow(TRPCError);
      await expect(caller.authenticate(authenticateInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'User not found',
      });
    });

    it('should throw BAD_REQUEST with default message when error is undefined', async () => {
      mockedAuthenticate.mockResolvedValue({
        success: false,
      });

      await expect(caller.authenticate(authenticateInput)).rejects.toMatchObject({
        code: 'BAD_REQUEST',
        message: 'Failed to authenticate user',
      });
    });

    it('should validate email is required', async () => {
      await expect(
        caller.authenticate({
          email: '',
          phone: '+1234567890',
          password: 'password123',
        })
      ).rejects.toThrow();
    });

    it('should validate password is required', async () => {
      await expect(
        caller.authenticate({
          email: 'test@example.com',
          phone: '+1234567890',
          password: '',
        })
      ).rejects.toThrow();
    });

    it('should validate required fields', async () => {
      await expect(caller.authenticate({} as any)).rejects.toThrow();
    });
  });
});
