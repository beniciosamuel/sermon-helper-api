// Authentication service - prepared for future backend integration
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignUpData {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: {
    id: string;
    email: string;
  };
}

class AuthService {
  // Mock authentication - replace with actual API calls
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock validation
        if (credentials.email && credentials.password) {
          resolve({
            success: true,
            message: 'Login successful',
            token: 'mock-token',
            user: {
              id: '1',
              email: credentials.email,
            },
          });
        } else {
          resolve({
            success: false,
            message: 'Invalid credentials',
          });
        }
      }, 1000);
    });
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock validation
        if (data.email && data.password && data.password === data.confirmPassword) {
          resolve({
            success: true,
            message: 'Account created successfully',
            token: 'mock-token',
            user: {
              id: '1',
              email: data.email,
            },
          });
        } else {
          resolve({
            success: false,
            message: 'Failed to create account',
          });
        }
      }, 1000);
    });
  }

  // Store token in localStorage (for future use)
  setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  clearToken(): void {
    localStorage.removeItem('auth_token');
  }
}

export const authService = new AuthService();
