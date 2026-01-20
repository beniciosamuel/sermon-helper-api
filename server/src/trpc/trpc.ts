/**
 * tRPC Initialization
 *
 * This is where tRPC is initialized and the base router/procedures are created.
 * This should be kept minimal - only tRPC setup, no business logic.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import type { TRPCContext, AuthenticatedTRPCContext } from './context';
import { OauthTokenRepository } from '../models/repositories/OauthTokenRepository';
import { UserRepository } from '../models/repositories/UserRepository';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error: _error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        // Add custom error data here if needed
      },
    };
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const middleware = t.middleware;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

/**
 * Middleware for logging (example of extensibility)
 */
const loggerMiddleware = middleware(async ({ path, type, next }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;

  // eslint-disable-next-line no-console
  console.log(`[tRPC] ${type} ${path} - ${duration}ms`);

  return result;
});

/**
 * Logged procedure - includes request logging
 */
export const loggedProcedure = publicProcedure.use(loggerMiddleware);

/**
 * Extracts the Bearer token from the Authorization header
 */
function extractBearerToken(authorizationHeader: string | undefined): string | null {
  if (!authorizationHeader) {
    return null;
  }

  const parts = authorizationHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Authentication middleware
 *
 * Validates the Bearer token from the Authorization header and injects
 * the authenticated user into the context.
 *
 * Fails fast with HTTP 401 if:
 * - No Authorization header is present
 * - The token format is invalid
 * - The token is not found in the database
 * - The user associated with the token does not exist
 */
const authMiddleware = middleware(async ({ ctx, next }) => {
  // Extract token from Authorization header
  const authHeader = ctx.req.headers.authorization;
  const token = extractBearerToken(authHeader);

  if (!token) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Missing or invalid Authorization header',
    });
  }

  // Find the OAuth token record
  const oauthToken = await OauthTokenRepository.findByOauthToken(token, ctx.context);

  if (!oauthToken) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Invalid or expired token',
    });
  }

  // Find the user associated with the token
  const user = await UserRepository.findById(oauthToken.user_id, ctx.context);

  if (!user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'User not found',
    });
  }

  // Proceed with the authenticated user in context
  return next({
    ctx: {
      ...ctx,
      user,
    } as AuthenticatedTRPCContext,
  });
});

/**
 * Protected procedure - requires authentication
 *
 * Use this for any procedure that requires an authenticated user.
 * The user will be available in ctx.user and is guaranteed to exist.
 *
 * @example
 * ```typescript
 * export const myProtectedRouter = router({
 *   getProfile: protectedProcedure.query(({ ctx }) => {
 *     // ctx.user is guaranteed to be a User here
 *     return { name: ctx.user.full_name };
 *   }),
 * });
 * ```
 */
export const protectedProcedure = publicProcedure.use(authMiddleware);
