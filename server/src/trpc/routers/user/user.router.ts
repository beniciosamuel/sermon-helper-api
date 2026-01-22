import { TRPCError } from '@trpc/server';
import { router, publicProcedure, protectedProcedure } from '../../trpc';
import {
  createUserInputSchema,
  findByIdInputSchema,
  findByEmailOrPhoneInputSchema,
} from '../../schemas';
import { createUser, findUserById, findUserByEmailOrPhone } from '../../../useCases';
import { authenticate } from '../../../useCases/authenticate';
import z from 'zod';

/**
 * User Router
 *
 * Maps use cases to tRPC procedures:
 * - create → mutation (createUser use case)
 * - findById → query (UserRepository.findById)
 */
export const userRouter = router({
  /**
   * Create a new user
   *
   * @mutation
   * @input CreateUserInput
   * @returns Created user data (without password_hash)
   */
  create: publicProcedure.input(createUserInputSchema).mutation(async ({ input, ctx }) => {
    const result = await createUser(input, ctx.context);

    if (!result.success || !result.user) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: result.error || 'Failed to create user',
      });
    }

    return {
      id: result.user.id,
      full_name: result.user.full_name,
      email: result.user.email,
      phone: result.user.phone,
      color_theme: result.user.color_theme,
      lang: result.user.lang,
      created_at: result.user.created_at,
      updated_at: result.user.updated_at,
      oauth_token: result.oauthToken,
    };
  }),

  /**
   * Find a user by ID
   *
   * @query
   * @input { id: number }
   * @returns User data or null if not found
   */
  findById: publicProcedure.input(findByIdInputSchema).query(async ({ input, ctx }) => {
    const result = await findUserById(input.id, ctx.context);

    if (!result.success || !result.user) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: result.error || `User with ID ${input.id} not found`,
      });
    }

    return {
      id: result.user.id,
      full_name: result.user.full_name,
      email: result.user.email,
      phone: result.user.phone,
      color_theme: result.user.color_theme,
      lang: result.user.lang,
      created_at: result.user.created_at,
      updated_at: result.user.updated_at,
    };
  }),
  /**
   * Find a user by email or phone
   *
   * @query
   * @input { email: string, phone: string }
   * @returns User data or null if not found
   */
  findByEmailOrPhone: publicProcedure
    .input(findByEmailOrPhoneInputSchema)
    .query(async ({ input, ctx }) => {
      const result = await findUserByEmailOrPhone(input.email, input.phone, ctx.context);

      if (!result.success || !result.user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            result.error || `User with email ${input.email} or phone ${input.phone} not found`,
        });
      }

      return {
        id: result.user.id,
        full_name: result.user.full_name,
        email: result.user.email,
        phone: result.user.phone,
        color_theme: result.user.color_theme,
        lang: result.user.lang,
        created_at: result.user.created_at,
        updated_at: result.user.updated_at,
      };
    }),

  authenticate: publicProcedure
    .input(
      z.object({
        email: z.string().optional(),
        phone: z.string().optional(),
        password: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const result = await authenticate({
        email: input.email || '',
        phone: input.phone || '',
        password: input.password,
        context: ctx.context,
      });

      if (!result.success) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to authenticate user',
        });
      }

      return {
        id: result.user?.id,
        full_name: result.user?.full_name,
        email: result.user?.email,
        phone: result.user?.phone,
        color_theme: result.user?.color_theme,
        lang: result.user?.lang,
        created_at: result.user?.created_at,
        updated_at: result.user?.updated_at,
        oauthToken: result.oauthToken,
      };
    }),

  /**
   * Get the current authenticated user
   *
   * @query
   * @returns Current user data if authenticated
   * @throws UNAUTHORIZED if not authenticated
   */
  getCurrentUser: protectedProcedure.query(async ({ ctx }) => {
    // ctx.user is guaranteed to exist because we use protectedProcedure
    return {
      id: ctx.user.id,
      full_name: ctx.user.full_name,
      email: ctx.user.email,
      phone: ctx.user.phone,
      color_theme: ctx.user.color_theme,
      lang: ctx.user.lang,
      created_at: ctx.user.created_at,
      updated_at: ctx.user.updated_at,
    };
  }),
});

/**
 * Type exports for client usage
 */
export type UserRouter = typeof userRouter;
