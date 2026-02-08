import { apiClient } from './api';
import type { AppDispatch } from '../store';

interface LoginRequest {
  username: string;
  password: string;
}

interface BackendLoginResponse {
  user: {
    id: string;
    username: string;
    fullName: string;
    role: 'MANAGER' | 'ADMIN' | 'WORKER';
  };
  accessToken: string;
  refreshToken: string;
}

interface LoginResponse {
  user: {
    userId: string;
    username: string;
    email: string;
    fullName: string;
    role: 'MANAGER' | 'ADMIN' | 'WORKER';
  };
  token: string;
  refreshToken: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role: 'MANAGER' | 'ADMIN' | 'WORKER';
}

export const authService = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await apiClient.post<BackendLoginResponse>('/auth/login', credentials);
    // Transform backend response to match frontend expectations
    return {
      user: {
        userId: response.user.id,
        username: response.user.username,
        email: '', // Backend doesn't provide email
        fullName: response.user.fullName,
        role: response.user.role,
      },
      token: response.accessToken,
      refreshToken: response.refreshToken,
    };
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
    const response = await apiClient.post<{ accessToken: string; refreshToken: string }>('/auth/refresh', {
      refreshToken,
    });
    if (response.accessToken) {
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
    }
    return {
      user: {
        userId: '', // Will be filled by caller
        username: '',
        email: '',
        fullName: '',
        role: 'MANAGER',
      },
      token: response.accessToken,
      refreshToken: response.refreshToken,
    };
  },

  async getCurrentUser(): Promise<LoginResponse['user']> {
    const response = await apiClient.get<{ id: string; username: string; fullName: string; role: 'MANAGER' | 'ADMIN' | 'WORKER' }>('/auth/me');
    return {
      userId: response.id,
      username: response.username,
      email: '', // Backend doesn't provide email
      fullName: response.fullName,
      role: response.role,
    };
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
