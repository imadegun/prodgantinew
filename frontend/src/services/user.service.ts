import { apiClient } from './api';

interface User {
  id: number;
  username: string;
  email: string | null;
  fullName: string | null;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string | null;
}

interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  role?: string;
  isActive?: boolean;
}

export const userService = {
  // Get all users with pagination and filters
  async getUsers(params?: {
    page?: number;
    limit?: number;
    role?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<{ data: User[]; meta: { page: number; limit: number; total: number; totalPages: number } }> {
    // Build query string manually to ensure proper types
    const queryParts: string[] = [];
    if (params?.page) queryParts.push(`page=${params.page}`);
    if (params?.limit) queryParts.push(`limit=${params.limit}`);
    if (params?.role) queryParts.push(`role=${params.role}`);
    if (params?.isActive !== undefined) queryParts.push(`isActive=${params.isActive}`);
    if (params?.search) queryParts.push(`search=${encodeURIComponent(params.search)}`);
    
    const queryString = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
    const url = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/users${queryString}`;
    
    const rawResponse = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!rawResponse.ok) {
      const errorData = await rawResponse.json();
      throw new Error(errorData.error?.message || 'Failed to fetch users');
    }
    
    const json = await rawResponse.json();
    return {
      data: json.data || [],
      meta: json.meta || { page: 1, limit: 10, total: 0, totalPages: 0 },
    };
  },

  // Get user by ID
  async getUser(id: number): Promise<User> {
    const response = await apiClient.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data;
  },

  // Create new user
  async createUser(data: CreateUserRequest): Promise<User> {
    const response = await apiClient.post<{ success: boolean; data: User; message: string }>('/users', data);
    return response.data;
  },

  // Update user
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await apiClient.put<{ success: boolean; data: User; message: string }>(`/users/${id}`, data);
    return response.data;
  },

  // Delete (deactivate) user
  async deleteUser(id: number): Promise<void> {
    await apiClient.delete(`/users/${id}`);
  },

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/users/change-password', {
      currentPassword,
      newPassword,
    });
  },
};