import { getTrpcClient, TrpcService } from './trpc/client';
import { setCookie, getCookie, deleteCookie } from '../utils/cookies';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
  color_theme?: 'light' | 'dark';
  language?: 'en' | 'pt';
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const trpc = await getTrpcClient();
      const result = await trpc.user.authenticate.mutate({
        email: credentials.email,
        password: credentials.password,
      });

      // Store the token on successful login
      if (result.oauthToken) {
        this.setToken(result.oauthToken);
        // Reset tRPC client to ensure it picks up the new token
        TrpcService.reset();
      }

      return {
        success: true,
        message: 'Login successful',
        token: result.oauthToken,
        user: {
          id: String(result.id),
          email: result.email || '',
          name: result.full_name || undefined,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: TrpcService.getErrorMessage(error),
      };
    }
  }

  /**
   * Create a new user account
   */
  async signUp(data: SignUpData): Promise<AuthResponse> {
    // Client-side validation for password confirmation
    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: 'Passwords do not match',
      };
    }

    try {
      const trpc = await getTrpcClient();
      const result = await trpc.user.create.mutate({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        color_theme: data.color_theme,
        language: data.language,
      });

      // Store the token on successful signup
      if (result.oauth_token) {
        this.setToken(result.oauth_token);
        // Reset tRPC client to ensure it picks up the new token
        TrpcService.reset();
      }

      return {
        success: true,
        message: 'Account created successfully',
        token: result.oauth_token,
        user: {
          id: String(result.id),
          email: result.email,
          name: result.full_name,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: TrpcService.getErrorMessage(error),
      };
    }
  }

  /**
   * Log out the current user
   * Clears the token and resets the tRPC client
   * Note: Redirect to login page is handled by AuthContext
   */
  logout(): void {
    this.clearToken();
    TrpcService.reset();
  }

  /**
   * Store token in cookie
   */
  setToken(token: string): void {
    setCookie('accessToken', token);
  }

  /**
   * Get the current auth token from cookie
   */
  getToken(): string | null {
    return getCookie('accessToken');
  }

  /**
   * Clear the stored auth token from cookie
   */
  clearToken(): void {
    deleteCookie('accessToken');
  }

  /**
   * Check if user is authenticated (checks if token exists in cookie)
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null;
  }
}

export const authService = new AuthService();
