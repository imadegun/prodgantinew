import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

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
        // Only handle 401 errors if we're not on the login page
        // This prevents redirecting to login when we're already there
        if (error.response?.status === 401 && window.location.pathname !== '/login') {
          // Don't automatically remove the token or redirect
          // Let the application handle this through proper error handling
          // This prevents the issue where a valid user gets logged out
        }
        return Promise.reject(error);
      }
    );
  }
  
  async get<T>(url: string, params?: any): Promise<T> {
    const response = await this.client.get(url, { params });
    return response.data.data;
  }
  
  async post<T>(url: string, data: any): Promise<T> {
    const response = await this.client.post(url, data);
    return response.data.data;
  }
  
  async put<T>(url: string, data: any): Promise<T> {
    const response = await this.client.put(url, data);
    return response.data.data;
  }
  
  async delete<T>(url: string): Promise<T> {
    const response = await this.client.delete(url);
    return response.data.data;
  }
}

export const apiClient = new ApiClient();
