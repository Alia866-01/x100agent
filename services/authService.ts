/**
 * Authentication Service
 * Uses Neon Auth SDK with Google OAuth support
 */

import { authClient } from '../lib/authClient';
import { api } from './api';
import type { AuthResponse, User } from '../types/api';

export class AuthService {
  /**
   * Sync user with local database after Neon Auth
   */
  private async syncUser(
    authProviderId: string,
    email: string,
    name?: string,
    companyName?: string
  ): Promise<{ user: User; tenant_id: string; token?: string }> {
    try {
      const response = await api.post<{
        user: User;
        tenant: { id: string; name: string; plan_tier: string };
        is_new: boolean;
        token?: string;
      }>('/api/users/sync', {
        auth_provider_id: authProviderId,
        email,
        name,
        company_name: companyName,
      });

      return {
        user: response.user,
        tenant_id: response.tenant.id,
        token: response.token,
      };
    } catch (error) {
      console.error('[AuthService] User sync failed:', error);
      throw new Error('Failed to sync user with database');
    }
  }

  /**
   * Login with Google OAuth
   */
  async loginWithGoogle(): Promise<void> {
    try {
      console.log('[AuthService] Initiating Google OAuth login');

      // Redirect to Google OAuth
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin + '/auth/callback',
      });

      // After redirect back, handleCallback will be called
    } catch (error) {
      console.error('[AuthService] Google login failed:', error);
      throw error;
    }
  }

  /**
   * Handle OAuth callback after redirect
   * Call this in your callback page
   */
  async handleOAuthCallback(): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Handling OAuth callback');
      console.log('[AuthService] Current URL:', window.location.href);
      console.log('[AuthService] URL params:', window.location.search);

      // Get session after OAuth redirect
      console.log('[AuthService] Attempting to get session from authClient...');
      const session = await authClient.getSession();
      console.log('[AuthService] Session result:', session ? 'found' : 'null');
      console.log('[AuthService] Full session object:', JSON.stringify(session, null, 2));

      if (!session) {
        console.error('[AuthService] No session found - OAuth callback may have failed');
        throw new Error('No session found after OAuth callback');
      }

      // Extract data from Neon Auth session structure
      const userData = session.data.user;
      const sessionData = session.data.session;

      console.log('[AuthService] User data:', {
        id: userData.id,
        email: userData.email,
        name: userData.name
      });

      // Sync with local database — returns our own platform JWT
      console.log('[AuthService] Syncing user with local database...');
      const syncResult = await this.syncUser(
        userData.id,
        userData.email,
        userData.name,
        userData.name
      );
      const { user, tenant_id } = syncResult;
      console.log('[AuthService] User synced successfully:', { user_id: user.id, tenant_id });

      // Use Neon Auth session token (JWT middleware disabled, just for identification)
      const token = sessionData.token;
      console.log('[AuthService] Storing auth data in localStorage...');

      localStorage.setItem('token', token);
      localStorage.setItem('tenant_id', tenant_id);
      localStorage.setItem('user', JSON.stringify(user));

      console.log('[AuthService] OAuth callback completed successfully');

      return {
        user,
        token,
        tenant_id,
        expires_at: sessionData.expiresAt instanceof Date ? sessionData.expiresAt.toISOString() : sessionData.expiresAt,
      };
    } catch (error) {
      console.error('[AuthService] OAuth callback handling failed:', error);
      console.error('[AuthService] Error type:', error instanceof Error ? error.constructor.name : typeof error);
      console.error('[AuthService] Error message:', error instanceof Error ? error.message : String(error));
      console.error('[AuthService] Error stack:', error instanceof Error ? error.stack : 'N/A');
      throw error;
    }
  }

  /**
   * Login user with email and password
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Attempting email/password login');

      // Sign in with Neon Auth
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (!result) {
        throw new Error('Login failed - no result returned');
      }

      // Get session
      const session = await authClient.getSession();

      if (!session) {
        throw new Error('Login failed - no session created');
      }

      // Sync with local database
      const { user, tenant_id } = await this.syncUser(
        session.data.user.id,
        session.data.user.email,
        session.data.user.name
      );

      // Store auth data
      const token = session.data.session.token;

      localStorage.setItem('token', token);
      localStorage.setItem('tenant_id', tenant_id);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        user,
        token,
        tenant_id,
        expires_at: session.data.session.expiresAt instanceof Date ? session.data.session.expiresAt.toISOString() : session.data.session.expiresAt,
      };
    } catch (error) {
      console.error('[AuthService] Login failed:', error);
      throw error;
    }
  }

  /**
   * Register new user with email confirmation
   */
  async register(
    email: string,
    password: string,
    companyName: string
  ): Promise<AuthResponse> {
    try {
      console.log('[AuthService] Attempting registration');

      // Sign up with Neon Auth (sends email confirmation)
      const result = await authClient.signUp.email({
        email,
        password,
        name: companyName,
      });

      if (!result) {
        throw new Error('Registration failed - no result returned');
      }

      // Get session
      const session = await authClient.getSession();

      if (!session) {
        throw new Error('Registration failed - no session created');
      }

      // Sync with local database (creates tenant + user)
      const { user, tenant_id } = await this.syncUser(
        session.data.user.id,
        session.data.user.email,
        session.data.user.name,
        companyName
      );

      // Store auth data
      const token = session.data.session.token;

      localStorage.setItem('token', token);
      localStorage.setItem('tenant_id', tenant_id);
      localStorage.setItem('user', JSON.stringify(user));

      return {
        user,
        token,
        tenant_id,
        expires_at: session.data.session.expiresAt instanceof Date ? session.data.session.expiresAt.toISOString() : session.data.session.expiresAt,
      };
    } catch (error) {
      console.error('[AuthService] Registration failed:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await authClient.signOut();
    } catch (error) {
      console.error('[AuthService] Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;

    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Get current tenant ID
   */
  getTenantId(): string | null {
    return localStorage.getItem('tenant_id');
  }

  /**
   * Fetch current user session from Neon Auth
   */
  async fetchCurrentUser(): Promise<User> {
    try {
      const session = await authClient.getSession();

      if (!session) {
        throw new Error('No active session');
      }

      // Sync with local database to get tenant info
      const { user } = await this.syncUser(
        session.data.user.id,
        session.data.user.email,
        session.data.user.name
      );

      localStorage.setItem('user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('[AuthService] Failed to fetch current user:', error);
      throw error;
    }
  }

  /**
   * Refresh authentication token
   * Automatically called when token expires or on API 401 errors
   */
  async refreshToken(): Promise<string | null> {
    try {
      console.log('[AuthService] Refreshing auth token...');

      // Get current session from Neon Auth
      // Neon Auth SDK handles token refresh automatically
      const session = await authClient.getSession();

      if (!session) {
        console.log('[AuthService] No session found, token refresh failed');
        // Clear auth data and redirect to login
        await this.logout();
        return null;
      }

      const newToken = session.data.session.token;

      // Update stored token
      localStorage.setItem('token', newToken);

      console.log('[AuthService] Token refreshed successfully');
      return newToken;
    } catch (error) {
      console.error('[AuthService] Token refresh failed:', error);
      // Clear auth data and redirect to login
      await this.logout();
      return null;
    }
  }

  /**
   * Check if token is expired or about to expire
   */
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      // Simple JWT expiration check
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();

      // Token expires in less than 5 minutes
      return exp - now < 5 * 60 * 1000;
    } catch {
      // If we can't parse token, consider it expired
      return true;
    }
  }

  /**
   * Ensure token is fresh before making API calls
   * Call this before important operations
   */
  async ensureFreshToken(): Promise<void> {
    if (this.isTokenExpired()) {
      await this.refreshToken();
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
