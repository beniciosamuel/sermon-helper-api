/**
 * tRPC Initialization
 * 
 * This is where tRPC is initialized and the base router/procedures are created.
 * This should be kept minimal - only tRPC setup, no business logic.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import type { TRPCContext } from './context';

/**
 * Initialization of tRPC backend
 * Should be done only once per backend!
 */
const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
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
  
  console.log(`[tRPC] ${type} ${path} - ${duration}ms`);
  
  return result;
});

/**
 * Logged procedure - includes request logging
 */
export const loggedProcedure = publicProcedure.use(loggerMiddleware);

/**
 * Protected procedure example (for future authentication)
 * Uncomment and modify when authentication is implemented
 */
// const authMiddleware = middleware(async ({ ctx, next }) => {
//   if (!ctx.user) {
//     throw new TRPCError({ code: 'UNAUTHORIZED' });
//   }
//   return next({
//     ctx: {
//       ...ctx,
//       user: ctx.user,
//     },
//   });
// });
// export const protectedProcedure = publicProcedure.use(authMiddleware);
