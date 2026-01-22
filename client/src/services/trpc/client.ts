/**
 * tRPC Client Service
 *
 * Provides a type-safe client for communicating with the server's tRPC API.
 * Uses the Secrets service for configuration and AuthService for authentication.
 *
 * Features:
 * - Lazy initialization (client created on first use)
 * - Singleton pattern (reuses same instance)
 * - Automatic Bearer token injection
 * - Single request support via httpLink
 *
 * @example
 * ```typescript
 * const trpc = await TrpcService.getClient();
 * const user = await trpc.user.findById.query({ id: 1 });
 * ```
 */

import { createTRPCProxyClient, httpLink, TRPCClientError } from '@trpc/client';
import type { AppRouter } from './types';
import { secrets } from '../Secrets';
import { authService } from '../AuthService';

/**
 * Type for the tRPC client instance
 */
export type TrpcClient = ReturnType<typeof createTRPCProxyClient<AppRouter>>;

/**
 * tRPC Service class
 *
 * Manages the tRPC client instance with lazy initialization.
 * The client is created once and reused for all subsequent calls.
 */
class TrpcServiceClass {
  private client: TrpcClient | null = null;
  private initPromise: Promise<TrpcClient> | null = null;

  /**
   * Get the tRPC client instance
   *
   * Creates the client on first call, returns cached instance on subsequent calls.
   * Uses a promise lock to prevent multiple simultaneous initializations.
   *
   * @returns Promise resolving to the tRPC client
   */
  async getClient(): Promise<TrpcClient> {
    // Return cached client if available
    if (this.client) {
      return this.client;
    }

    // If initialization is in progress, wait for it
    if (this.initPromise) {
      return this.initPromise;
    }

    // Start initialization
    this.initPromise = this.initializeClient();

    try {
      this.client = await this.initPromise;
      return this.client;
    } finally {
      this.initPromise = null;
    }
  }

  /**
   * Initialize a new tRPC client
   *
   * @returns Promise resolving to a new tRPC client instance
   */
  private async initializeClient(): Promise<TrpcClient> {
    const trpcUrl = await secrets.getTrpcUrl();

    return createTRPCProxyClient<AppRouter>({
      links: [
        httpLink({
          url: trpcUrl,
          /**
           * Custom headers function
           * Reads token from cookie and sends it in Authorization header
           * Only adds Authorization header if token exists
           * Content-Type is handled by tRPC automatically
           */
          headers: () => {
            const token = authService.getToken(); // Reads from cookie
            if (token) {
              return {
                Authorization: `Bearer ${token}`,
              };
            }
            return {};
          },
        }),
      ],
    });
  }

  /**
   * Reset the client instance
   *
   * Useful when the user logs out or when the server URL changes.
   * The next call to getClient() will create a new instance.
   */
  reset(): void {
    this.client = null;
    this.initPromise = null;
  }

  /**
   * Check if a given error is a tRPC client error
   *
   * @param error - The error to check
   * @returns True if the error is a TRPCClientError
   */
  isTrpcError(error: unknown): error is TRPCClientError<AppRouter> {
    return error instanceof TRPCClientError;
  }

  /**
   * Extract error message from a tRPC error or unknown error
   *
   * @param error - The error to extract message from
   * @returns Human-readable error message
   */
  getErrorMessage(error: unknown): string {
    if (this.isTrpcError(error)) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'An unexpected error occurred';
  }
}

/**
 * Singleton instance of TrpcService
 */
export const TrpcService = new TrpcServiceClass();

/**
 * Convenience export for direct client access
 *
 * @example
 * ```typescript
 * const trpc = await getTrpcClient();
 * const user = await trpc.user.findById.query({ id: 1 });
 * ```
 */
export const getTrpcClient = () => TrpcService.getClient();
