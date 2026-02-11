import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface ApiError {
  code: string;
  message: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: ApiError;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private client: AxiosInstance;
  
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors(): void {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Only handle 401 errors if we're not on login page
        // This prevents redirecting to login when we're already there
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
          // Don't automatically remove token or redirect
          // Let application handle this through proper error handling
          // This prevents issue where a valid user gets logged out
        }
        return Promise.reject(error);
      }
    );
  }
  
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<ApiResponse<T>>(url, { params });
    return response.data.data;
  }
  
  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.client.post<ApiResponse<T>>(url, data);
    return response.data.data;
  }
  
  async put<T>(url: string, data: any): Promise<T> {
    const response = await this.client.put<ApiResponse<T>>(url, data);
    return response.data.data;
  }
  
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete<ApiResponse<T>>(url);
    return response.data.data;
  }
  
  async patch<T>(url: string, data: any): Promise<T> {
    const response = await this.client.patch<ApiResponse<T>>(url, data);
    return response.data.data;
  }
  
  // Helper method to get error message from Axios error
  getErrorMessage(error: any): string {
    if (error.response?.data?.error?.message) {
      return error.response.data.error.message;
    }
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  }
  
  // Helper method to get error code from Axios error
  getErrorCode(error: any): string {
    if (error.response?.data?.error?.code) {
      return error.response.data.error.code;
    }
    if (error.code) {
      return error.code;
    }
    return 'UNKNOWN_ERROR';
  }
}

export const apiClient = new ApiClient();
export type { ApiError, ApiResponse };
