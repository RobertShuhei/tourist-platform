import { useAuth } from '@/contexts/AuthContext';
import { useCallback, useState, useEffect } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: Record<string, string>;
}

export function useApi() {
  const { token, logout } = useAuth();

  const apiRequest = useCallback(async <T = any>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<T> => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add authentication header if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401 && token) {
        logout(); // This will redirect to login
        throw new Error('Authentication expired. Please log in again.');
      }

      // Handle other HTTP errors
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // If parsing error response fails, use the default message
        }
        
        throw new Error(errorMessage);
      }

      // Handle successful responses
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text() as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }, [token, logout]);

  // Convenience methods for common HTTP verbs
  const get = useCallback(<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'GET' });
  }, [apiRequest]);

  const post = useCallback(<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [apiRequest]);

  const put = useCallback(<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [apiRequest]);

  const patch = useCallback(<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> => {
    return apiRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }, [apiRequest]);

  const del = useCallback(<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> => {
    return apiRequest<T>(endpoint, { ...options, method: 'DELETE' });
  }, [apiRequest]);

  // Form data request (for file uploads or form-encoded data)
  const postForm = useCallback(<T = any>(endpoint: string, formData: FormData | URLSearchParams, options: ApiRequestOptions = {}): Promise<T> => {
    const { headers, ...restOptions } = options;
    return apiRequest<T>(endpoint, {
      ...restOptions,
      method: 'POST',
      headers: {
        // Don't set Content-Type for FormData, let browser set it with boundary
        ...headers,
      },
      body: formData,
    });
  }, [apiRequest]);

  return {
    request: apiRequest,
    get,
    post,
    put,
    patch,
    delete: del,
    postForm,
  };
}

// Hook for handling common data fetching patterns
export function useApiData<T>(endpoint: string | null, dependencies: any[] = []) {
  const { get } = useApi();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!endpoint) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await get<T>(endpoint);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [endpoint, get]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
}

