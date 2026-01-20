/**
 * tRPC Server Setup
 * 
 * This file initializes tRPC and exports the core building blocks:
 * - router: Creates new routers
 * - publicProcedure: Procedure without authentication
 * - protectedProcedure: Procedure with authentication (for future use)
 * - createContext: Creates the context for each request
 * - createTrpcRouter: Express middleware for versioned tRPC routes
 */

export { router, publicProcedure, createCallerFactory } from './trpc';
export { createContext, type TRPCContext } from './context';
export { appRouter, type AppRouter } from './routers';

// Export Express adapter
export { createTrpcRouter } from './adapters';

// Export schemas for client-side usage
export * from './schemas';
