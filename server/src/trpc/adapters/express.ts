/**
 * Express Adapter for tRPC
 * 
 * This file creates the Express middleware for tRPC with versioned routes.
 * The tRPC endpoint is mounted at /v1/trpc
 */

import { Router } from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter } from '../routers';
import { createContext } from '../context';

/**
 * Creates tRPC Express middleware for a specific version
 */
function createTrpcMiddleware() {
  return trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError({ error, path }) {
      console.error(`[tRPC Error] ${path}:`, error.message);
    },
  });
}

/**
 * Creates the v1 tRPC router
 * Mounts tRPC at /trpc, full path: /v1/trpc
 */
function createV1Router(): Router {
  const router = Router();

  router.use(
    '/trpc',
    createTrpcMiddleware() as any // Type assertion needed due to Express version mismatch in monorepo
  );

  return router;
}

/**
 * Creates the main tRPC router with all version routes
 * 
 * Usage:
 *   app.use(createTrpcRouter());
 * 
 * Endpoints:
 *   - POST /v1/trpc/user.create
 *   - GET /v1/trpc/user.findById?input={"id":1}
 */
export function createTrpcRouter(): Router {
  const trpcRouter = Router();

  // Mount v1 tRPC routes
  trpcRouter.use('/v1', createV1Router());

  // Future versions can be added here:
  // trpcRouter.use('/v2', createV2Router());

  return trpcRouter;
}
