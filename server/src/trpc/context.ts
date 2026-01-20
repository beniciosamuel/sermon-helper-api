/**
 * tRPC Context
 *
 * Creates the context that is available in all procedures.
 * This bridges tRPC with the existing Context service.
 */

import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import { Context } from '../services/Context';
import type { User } from '../models/entities/User';

/**
 * The context type that will be available in all procedures
 */
export interface TRPCContext {
  /** The application context with database, email, secrets, etc. */
  context: Context;
  /** Request object (for accessing headers, etc.) */
  req: CreateExpressContextOptions['req'];
  /** Response object */
  res: CreateExpressContextOptions['res'];
  /** Authenticated user (set by auth middleware) */
  user: User | null;
}

/**
 * Context type for protected procedures (user is guaranteed to exist)
 */
export interface AuthenticatedTRPCContext extends TRPCContext {
  user: User;
}

/**
 * Context cache to avoid reinitializing on every request
 * In production, you might want a more sophisticated approach
 */
let cachedContext: Context | null = null;

/**
 * Creates the context for each tRPC request
 * This is called for every request and the result is passed to all procedures
 */
export async function createContext(opts: CreateExpressContextOptions): Promise<TRPCContext> {
  // Initialize or reuse the application context
  if (!cachedContext) {
    cachedContext = await Context.initialize();
  }

  return {
    context: cachedContext,
    req: opts.req,
    res: opts.res,
    user: null,
  };
}

/**
 * Type helper for inferring context type
 */
export type CreateContextFn = typeof createContext;
