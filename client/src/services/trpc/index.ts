/**
 * tRPC Service Module
 *
 * Provides a type-safe client for communicating with the server's tRPC API.
 *
 * @example
 * ```typescript
 * import { getTrpcClient, TrpcService } from './services/trpc';
 *
 * // Get the client
 * const trpc = await getTrpcClient();
 *
 * // Create a user
 * const user = await trpc.user.create.mutate({
 *   name: 'John Doe',
 *   email: 'john@example.com',
 *   phone: '+5511999999999',
 *   password: 'password123',
 * });
 *
 * // Find a user
 * const found = await trpc.user.findById.query({ id: 1 });
 *
 * // Handle errors
 * try {
 *   await trpc.user.findById.query({ id: 999 });
 * } catch (error) {
 *   console.error(TrpcService.getErrorMessage(error));
 * }
 * ```
 */

// Client exports
export { TrpcService, getTrpcClient } from './client';
export type { TrpcClient } from './client';

// Type exports
export type { AppRouter, RouterInputs, RouterOutputs } from './types';
