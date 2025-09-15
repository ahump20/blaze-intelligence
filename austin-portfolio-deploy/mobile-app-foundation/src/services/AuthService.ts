/**
 * 🔐 BLAZE INTELLIGENCE AUTHENTICATION SERVICE
 *
 * Championship-level authentication and user management
 * Integrates with production MCP server for secure authentication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import Keychain from 'react-native-keychain';
import axios, { AxiosInstance } from 'axios';

// Types
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  organization?: string;
  role: string;
  subscriptionTier: 'free' | 'basic' | 'pro' | 'enterprise';
  permissions: string[];
  createdAt: string;
  isEmailVerified?: boolean;
}

interface AuthTokens {
  token: string;
  refreshToken: string;
  expiresAt: number;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organization?: string;
  role?: string;
}

interface AuthResponse {
  success: boolean;
  user?: User;
  token?: string;
  refreshToken?: string;
  message: string;
}

/**
 * 🏆 Championship Authentication Service
 */
class BlazeAuthService {
  private apiClient: AxiosInstance;
  private baseURL: string;
  private currentUser: User | null = null;
  private authTokens: AuthTokens | null = null;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    // Production MCP Server URL
    this.baseURL = 'https://blaze-intelligence-mcp.onrender.com';

    // Initialize API client
    this.apiClient = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'BlazeIntelligence-Mobile/1.0.0',
      },
    });

    // Setup request interceptor for authentication
    this.apiClient.interceptors.request.use(
      async (config) => {
        const tokens = await this.getStoredTokens();
        if (tokens?.token) {
          config.headers.Authorization = `Bearer ${tokens.token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Setup response interceptor for token refresh
    this.apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          const refreshed = await this.refreshAccessToken();
          if (refreshed) {
            return this.apiClient(originalRequest);
          } else {
            await this.logout();
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * 🚀 Initialize Authentication Service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔐 Initializing Blaze Authentication Service...');

      // Check for stored authentication data
      const storedTokens = await this.getStoredTokens();
      const storedUser = await this.getStoredUser();

      if (storedTokens && storedUser) {
        // Validate stored tokens
        if (this.isTokenValid(storedTokens)) {
          this.authTokens = storedTokens;
          this.currentUser = storedUser;

          // Verify with server
          const isValid = await this.validateSession();
          if (!isValid) {
            await this.clearStoredAuth();
          }
        } else {
          // Try to refresh tokens
          const refreshed = await this.refreshAccessToken();
          if (!refreshed) {
            await this.clearStoredAuth();
          }
        }
      }

      console.log('✅ Authentication service initialized');
    } catch (error) {
      console.error('❌ Authentication service initialization failed:', error);
      await this.clearStoredAuth();
    }
  }

  /**
   * 🔑 User Login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.email);

      const response = await this.apiClient.post<AuthResponse>('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { data } = response;

      if (data.success && data.user && data.token && data.refreshToken) {
        // Calculate token expiration (24 hours from now)
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

        const tokens: AuthTokens = {
          token: data.token,
          refreshToken: data.refreshToken,
          expiresAt,
        };

        // Store authentication data
        await this.storeAuthData(data.user, tokens);

        this.currentUser = data.user;
        this.authTokens = tokens;

        console.log('✅ Login successful for:', data.user.email);

        return {
          success: true,
          user: data.user,
          message: 'Login successful',
        };
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Login failed';

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * 📝 User Signup
   */
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      console.log('📝 Creating account for:', credentials.email);

      const response = await this.apiClient.post<AuthResponse>('/auth/signup', {
        email: credentials.email,
        password: credentials.password,
        firstName: credentials.firstName,
        lastName: credentials.lastName,
        organization: credentials.organization,
        role: credentials.role || 'analyst',
      });

      const { data } = response;

      if (data.success && data.user && data.token && data.refreshToken) {
        // Calculate token expiration
        const expiresAt = Date.now() + (24 * 60 * 60 * 1000);

        const tokens: AuthTokens = {
          token: data.token,
          refreshToken: data.refreshToken,
          expiresAt,
        };

        // Store authentication data
        await this.storeAuthData(data.user, tokens);

        this.currentUser = data.user;
        this.authTokens = tokens;

        console.log('✅ Account created successfully for:', data.user.email);

        return {
          success: true,
          user: data.user,
          message: 'Account created successfully',
        };
      } else {
        throw new Error(data.message || 'Account creation failed');
      }
    } catch (error: any) {
      console.error('❌ Signup failed:', error);

      const errorMessage = error.response?.data?.message || error.message || 'Account creation failed';

      return {
        success: false,
        message: errorMessage,
      };
    }
  }

  /**
   * 🚪 User Logout
   */
  async logout(): Promise<void> {
    try {
      console.log('🚪 Logging out user...');

      // Notify server of logout
      if (this.authTokens?.token) {
        try {
          await this.apiClient.post('/auth/logout');
        } catch (error) {
          console.warn('⚠️ Server logout notification failed:', error);
        }
      }

      // Clear stored authentication data
      await this.clearStoredAuth();

      this.currentUser = null;
      this.authTokens = null;

      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout error:', error);
    }
  }

  /**
   * 🔄 Refresh Access Token
   */
  async refreshAccessToken(): Promise<boolean> {
    // Prevent multiple simultaneous refresh attempts
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;

    return result;
  }

  private async performTokenRefresh(): Promise<boolean> {
    try {
      const storedTokens = await this.getStoredTokens();
      if (!storedTokens?.refreshToken) {
        return false;
      }

      console.log('🔄 Refreshing access token...');

      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refreshToken: storedTokens.refreshToken,
      });

      const { data } = response;

      if (data.success && data.token) {
        const newTokens: AuthTokens = {
          token: data.token,
          refreshToken: storedTokens.refreshToken, // Keep existing refresh token
          expiresAt: Date.now() + (24 * 60 * 60 * 1000),
        };

        await this.storeTokens(newTokens);
        this.authTokens = newTokens;

        console.log('✅ Token refresh successful');
        return true;
      } else {
        throw new Error(data.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      return false;
    }
  }

  /**
   * ✅ Validate Current Session
   */
  async validateSession(): Promise<boolean> {
    try {
      if (!this.authTokens?.token) {
        return false;
      }

      const response = await this.apiClient.get('/health');
      return response.status === 200;
    } catch (error) {
      console.warn('⚠️ Session validation failed:', error);
      return false;
    }
  }

  /**
   * 👤 Get Current User
   */
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  /**
   * 🔍 Check Authentication Status
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      if (!this.currentUser || !this.authTokens) {
        const storedTokens = await this.getStoredTokens();
        const storedUser = await this.getStoredUser();

        if (!storedTokens || !storedUser) {
          return false;
        }

        this.authTokens = storedTokens;
        this.currentUser = storedUser;
      }

      // Check token validity
      if (!this.isTokenValid(this.authTokens)) {
        const refreshed = await this.refreshAccessToken();
        return refreshed;
      }

      return true;
    } catch (error) {
      console.error('❌ Authentication check failed:', error);
      return false;
    }
  }

  /**
   * 🔑 Get API Client for Authenticated Requests
   */
  getApiClient(): AxiosInstance {
    return this.apiClient;
  }

  /**
   * 💾 Storage Methods
   */
  private async storeAuthData(user: User, tokens: AuthTokens): Promise<void> {
    try {
      await Promise.all([
        this.storeUser(user),
        this.storeTokens(tokens),
        this.storeSecureTokens(tokens),
      ]);
    } catch (error) {
      console.error('❌ Failed to store auth data:', error);
      throw error;
    }
  }

  private async storeUser(user: User): Promise<void> {
    await AsyncStorage.setItem('blaze_user', JSON.stringify(user));
  }

  private async storeTokens(tokens: AuthTokens): Promise<void> {
    await AsyncStorage.setItem('blaze_tokens', JSON.stringify(tokens));
  }

  private async storeSecureTokens(tokens: AuthTokens): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        'blaze_secure_tokens',
        'access_token',
        tokens.token
      );
    } catch (error) {
      console.warn('⚠️ Failed to store secure tokens:', error);
    }
  }

  private async getStoredUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem('blaze_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('❌ Failed to retrieve stored user:', error);
      return null;
    }
  }

  private async getStoredTokens(): Promise<AuthTokens | null> {
    try {
      const tokensData = await AsyncStorage.getItem('blaze_tokens');
      return tokensData ? JSON.parse(tokensData) : null;
    } catch (error) {
      console.error('❌ Failed to retrieve stored tokens:', error);
      return null;
    }
  }

  private async clearStoredAuth(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem('blaze_user'),
        AsyncStorage.removeItem('blaze_tokens'),
        Keychain.resetInternetCredentials('blaze_secure_tokens'),
      ]);
    } catch (error) {
      console.error('❌ Failed to clear stored auth:', error);
    }
  }

  /**
   * 🔍 Token Validation
   */
  private isTokenValid(tokens: AuthTokens): boolean {
    if (!tokens.token || !tokens.expiresAt) {
      return false;
    }

    // Check if token expires within the next 5 minutes
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    return tokens.expiresAt > fiveMinutesFromNow;
  }

  /**
   * 🔧 Utility Methods
   */
  getSubscriptionTier(): string {
    return this.currentUser?.subscriptionTier || 'free';
  }

  hasPermission(permission: string): boolean {
    return this.currentUser?.permissions?.includes(permission) || false;
  }

  isEmailVerified(): boolean {
    return this.currentUser?.isEmailVerified || false;
  }

  getFullName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`.trim();
  }
}

// Export singleton instance
export const AuthService = new BlazeAuthService();

// Export types
export type {
  User,
  AuthTokens,
  LoginCredentials,
  SignupCredentials,
  AuthResponse,
};