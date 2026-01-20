/**
 * Root App Router
 *
 * This file combines all domain routers into a single app router.
 * Add new domain routers here as the application grows.
 */

import { router } from '../trpc';
import { userRouter } from './user/user.router';

/**
 * The root app router that combines all domain routers
 *
 * Structure:
 * - user: User-related procedures (createUser, findById, etc.)
 * - Add more domain routers as needed (e.g., sermon, presentation, etc.)
 */
export const appRouter = router({
  user: userRouter,
  // Add more domain routers here:
  // sermon: sermonRouter,
  // presentation: presentationRouter,
});

/**
 * Export type definition for the app router
 * This is used by the client for type-safe API calls
 */
export type AppRouter = typeof appRouter;
