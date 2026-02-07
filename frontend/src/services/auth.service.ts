import { apiClient } from './api';
import type { AppDispatch } from '../store';

interface LoginRequest {
  username: string;
  password: string;
}

interface LoginResponse {
  user: {
    userId: string;
    username: string;
    email: string;
    fullName: string;
    role: 'MANAGER' | 'ADMIN';
  };
  token: string;
  refreshToken: string;
  expiresIn: number;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'MANAGER' | 'ADMIN';
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
    return response;
  },

  async register(data: RegisterRequest): Promise<any> {
    const response = await apiClient.post('/auth/register', data);
    return response;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout', {});
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/refresh', {
      refreshToken,
    });
    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return response;
  },

  async getCurrentUser(): Promise<LoginResponse['user']> {
    const response = await apiClient.get<LoginResponse['user']>('/auth/me');
    return response;
  },

  async resetPassword(email: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { email });
  },

  async updateProfile(data: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<void> {
    await apiClient.put('/auth/profile', data);
  },
};
