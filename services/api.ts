/**
 * API Client for X100 Platform
 * Handles all HTTP requests to the backend with authentication
 */

import type { APIError } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.hostname !== 'localhost' ? '' : 'http://localhost:8000');

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get stored auth token from localStorage
   */
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Get stored tenant_id from localStorage
   */
  private getTenantId(): string | null {
    return localStorage.getItem('tenant_id');
  }

  /**
   * Build headers for authenticated requests
   */
  private buildHeaders(customHeaders?: HeadersInit): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const tenantId = this.getTenantId();
    if (tenantId) {
      headers['x-tenant-id'] = tenantId;
    }

    return headers;
  }

  /**
   * Handle API errors uniformly
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}: ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch {
        // If response is not JSON, use status text
      }

      // Handle 401 Unauthorized - clear auth but don't hard-redirect (breaks SPA)
      if (response.status === 401) {
        console.warn('[API] 401 Unauthorized — clearing auth data');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('tenant_id');
      }

      const error: APIError = {
        detail: errorDetail,
        status_code: response.status,
      };

      throw error;
    }

    // Handle empty responses (204 No Content)
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  /**
   * Generic request method
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers = this.buildHeaders(options.headers);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      // Network error or API error
      if (error && typeof error === 'object' && 'detail' in error) {
        throw error; // API error already formatted
      }

      // Network error
      throw {
        detail: error instanceof Error ? error.message : 'Network error',
        status_code: 0,
      } as APIError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  /**
   * Upload file with multipart/form-data
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, string>
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const token = this.getToken();
    const tenantId = this.getTenantId();

    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (tenantId) headers['x-tenant-id'] = tenantId;
    // Note: Don't set Content-Type for FormData, browser will set it with boundary

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return this.handleResponse<T>(response);
  }
}

// Export singleton instance
export const api = new ApiClient();
