/**
 * User Router
 * 
 * tRPC router for user-related procedures.
 * This router wraps the existing use cases and does NOT contain business logic.
 * 
 * Procedures:
 * - Mutations: create (creates a new user)
 * - Queries: findById (fetches a user by ID)
 */

import { TRPCError } from '@trpc/server';
import { router, publicProcedure } from '../../trpc';
import { createUserInputSchema, findByIdInputSchema } from '../../schemas';
import { createUser } from '../../../useCases';
import { UserRepository } from '../../../models/repositories/UserRepository';

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
  create: publicProcedure
    .input(createUserInputSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await createUser(input, ctx.context);

      if (!result.success || !result.user) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: result.error || 'Failed to create user',
        });
      }

      // Return user without sensitive data
      const { password_hash, deleted_at, ...safeUser } = result.user;
      return safeUser;
    }),

  /**
   * Find a user by ID
   * 
   * @query
   * @input { id: number }
   * @returns User data or null if not found
   */
  findById: publicProcedure
    .input(findByIdInputSchema)
    .query(async ({ input, ctx }) => {
      const user = await UserRepository.findById(input.id, ctx.context);

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `User with ID ${input.id} not found`,
        });
      }

      // Return user without sensitive data
      const { password_hash, deleted_at, ...safeUser } = user;
      return safeUser;
    }),
});

/**
 * Type exports for client usage
 */
export type UserRouter = typeof userRouter;
