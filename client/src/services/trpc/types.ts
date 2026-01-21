/**
 * tRPC Type Definitions
 *
 * This file exports the AppRouter type from the server for end-to-end type safety.
 * The types are imported directly from the server source code.
 */

import type { inferRouterInputs, inferRouterOutputs } from '@trpc/server';

// Import the AppRouter type from the server
// This provides full type-safety for all tRPC procedures
export type { AppRouter } from '../../../../server/src/trpc';

// Re-import for local type inference
import type { AppRouter } from '../../../../server/src/trpc';

/**
 * Helper type for inferring router input types
 *
 * @example
 * type CreateUserInput = RouterInputs['user']['create'];
 */
export type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Helper type for inferring router output types
 *
 * @example
 * type CreateUserOutput = RouterOutputs['user']['create'];
 */
export type RouterOutputs = inferRouterOutputs<AppRouter>;
