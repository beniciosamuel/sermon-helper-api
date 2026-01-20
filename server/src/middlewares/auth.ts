/**
 * Express Authentication Middleware
 *
 * Validates Bearer tokens from the Authorization header and injects
 * the authenticated user into the request object.
 */

import { Request, Response, NextFunction } from 'express';
import { Context } from '../services/Context';
import { OauthTokenRepository } from '../models/repositories/OauthTokenRepository';
import { UserRepository } from '../models/repositories/UserRepository';
import type { User } from '../models/entities/User';

/**
 * Extends Express Request to include authenticated user
 */
export interface AuthenticatedRequest extends Request {
  user: User;
  context: Context;
}

/**
 * Context cache to avoid reinitializing on every request
 */
let cachedContext: Context | null = null;

/**
 * Gets or initializes the application context
 */
async function getContext(): Promise<Context> {
  if (!cachedContext) {
    cachedContext = await Context.initialize();
  }
  return cachedContext;
}

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
 * Authentication middleware for Express routes
 *
 * Validates the Bearer token from the Authorization header and injects
 * the authenticated user into req.user.
 *
 * Fails fast with HTTP 401 if:
 * - No Authorization header is present
 * - The token format is invalid
 * - The token is not found in the database
 * - The user associated with the token does not exist
 *
 * @example
 * ```typescript
 * import { authMiddleware, AuthenticatedRequest } from './middlewares/auth';
 *
 * // Protect a single route
 * app.get('/profile', authMiddleware, (req: AuthenticatedRequest, res) => {
 *   res.json({ user: req.user });
 * });
 *
 * // Protect all routes in a router
 * const protectedRouter = express.Router();
 * protectedRouter.use(authMiddleware);
 * protectedRouter.get('/data', (req: AuthenticatedRequest, res) => {
 *   res.json({ data: 'protected data', userId: req.user.id });
 * });
 * ```
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Extract token from Authorization header
    const token = extractBearerToken(req.headers.authorization);

    if (!token) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or invalid Authorization header',
      });
      return;
    }

    // Get application context
    const context = await getContext();

    // Find the OAuth token record
    const oauthToken = await OauthTokenRepository.findByOauthToken(token, context);

    if (!oauthToken) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired token',
      });
      return;
    }

    // Find the user associated with the token
    const user = await UserRepository.findById(oauthToken.user_id, context);

    if (!user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: 'User not found',
      });
      return;
    }

    // Inject user and context into request
    (req as AuthenticatedRequest).user = user;
    (req as AuthenticatedRequest).context = context;

    next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Auth Middleware Error]', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Authentication failed due to an internal error',
    });
  }
}

/**
 * Factory function to create auth middleware with a custom context
 * Useful for testing or when you want to inject a specific context
 */
export function createAuthMiddleware(context: Context) {
  return async function (req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = extractBearerToken(req.headers.authorization);

      if (!token) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header',
        });
        return;
      }

      const oauthToken = await OauthTokenRepository.findByOauthToken(token, context);

      if (!oauthToken) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid or expired token',
        });
        return;
      }

      const user = await UserRepository.findById(oauthToken.user_id, context);

      if (!user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'User not found',
        });
        return;
      }

      (req as AuthenticatedRequest).user = user;
      (req as AuthenticatedRequest).context = context;

      next();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Auth Middleware Error]', error);
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'Authentication failed due to an internal error',
      });
    }
  };
}
