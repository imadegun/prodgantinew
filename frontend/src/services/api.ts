import axios from 'axios';
import { User, POL, Alert, DashboardStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth services
export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },
};

// POL services
export const polService = {
  getAll: async (filters?: { status?: string; dateFrom?: string; dateTo?: string; search?: string }): Promise<POL[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params.append('dateTo', filters.dateTo);
    if (filters?.search) params.append('search', filters.search);
    const response = await api.get(`/pols?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<POL> => {
    const response = await api.get(`/pols/${id}`);
    return response.data;
  },

  create: async (polData: Partial<POL>): Promise<POL> => {
    const response = await api.post('/pols', polData);
    return response.data;
  },

  update: async (id: number, polData: Partial<POL>): Promise<POL> => {
    const response = await api.put(`/pols/${id}`, polData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/pols/${id}`);
  },

  updateStatus: async (id: number, status: POL['status']): Promise<POL> => {
    const response = await api.patch(`/pols/${id}/status`, { status });
    return response.data;
  },
};

// Product services (from gayafusionall)
export const productService = {
  search: async (query: string): Promise<any[]> => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getByCode: async (code: string): Promise<any> => {
    const response = await api.get(`/products/${code}`);
    return response.data;
  },

  getMaterialRequirements: async (productCode: string): Promise<any> => {
    const response = await api.get(`/products/${productCode}/materials`);
    return response.data;
  },

  getToolRequirements: async (productCode: string): Promise<any> => {
    const response = await api.get(`/products/${productCode}/tools`);
    return response.data;
  },
};

// Production services
export const productionService = {
  getRecords: async (polDetailId: number): Promise<any[]> => {
    const response = await api.get(`/production/${polDetailId}/records`);
    return response.data;
  },

  addRecord: async (polDetailId: number, recordData: any): Promise<any> => {
    const response = await api.post(`/production/${polDetailId}/records`, recordData);
    return response.data;
  },

  updateRecord: async (recordId: number, recordData: any): Promise<any> => {
    const response = await api.put(`/production/records/${recordId}`, recordData);
    return response.data;
  },

  getDecorationTasks: async (polDetailId: number): Promise<any[]> => {
    const response = await api.get(`/production/${polDetailId}/decorations`);
    return response.data;
  },

  addDecorationTask: async (polDetailId: number, taskData: any): Promise<any> => {
    const response = await api.post(`/production/${polDetailId}/decorations`, taskData);
    return response.data;
  },

  updateDecorationTask: async (taskId: number, taskData: any): Promise<any> => {
    const response = await api.put(`/production/decorations/${taskId}`, taskData);
    return response.data;
  },
};

// Alert services
export const alertService = {
  getAll: async (filters?: { type?: string; priority?: string; status?: string }): Promise<Alert[]> => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.status) params.append('status', filters.status);
    const response = await api.get(`/alerts?${params.toString()}`);
    return response.data;
  },

  acknowledge: async (id: number): Promise<Alert> => {
    const response = await api.post(`/alerts/${id}/acknowledge`);
    return response.data;
  },

  resolve: async (id: number, notes: string): Promise<Alert> => {
    const response = await api.post(`/alerts/${id}/resolve`, { notes });
    return response.data;
  },

  getStats: async (): Promise<{ critical: number; warning: number; info: number }> => {
    const response = await api.get('/alerts/stats');
    return response.data;
  },
};

// Dashboard services
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/reports/dashboard');
    return response.data;
  },

  getRecentPOLs: async (limit: number = 5): Promise<POL[]> => {
    const response = await api.get(`/reports/recent-pols?limit=${limit}`);
    return response.data;
  },

  getUpcomingDeliveries: async (): Promise<any[]> => {
    const response = await api.get('/reports/upcoming-deliveries');
    return response.data;
  },
};

// Logbook services
export const logbookService = {
  getAll: async (filters?: any): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const response = await api.get(`/logbook?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/logbook/${id}`);
    return response.data;
  },

  create: async (entryData: any): Promise<any> => {
    const response = await api.post('/logbook', entryData);
    return response.data;
  },

  update: async (id: number, entryData: any): Promise<any> => {
    const response = await api.put(`/logbook/${id}`, entryData);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/logbook/${id}`);
  },
};

// Revision ticket services
export const revisionService = {
  getAll: async (filters?: any): Promise<any[]> => {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });
    }
    const response = await api.get(`/revisions?${params.toString()}`);
    return response.data;
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/revisions/${id}`);
    return response.data;
  },

  create: async (ticketData: any): Promise<any> => {
    const response = await api.post('/revisions', ticketData);
    return response.data;
  },

  update: async (id: number, ticketData: any): Promise<any> => {
    const response = await api.put(`/revisions/${id}`, ticketData);
    return response.data;
  },

  submit: async (id: number): Promise<any> => {
    const response = await api.post(`/revisions/${id}/submit`);
    return response.data;
  },

  approve: async (id: number): Promise<any> => {
    const response = await api.post(`/revisions/${id}/approve`);
    return response.data;
  },

  reject: async (id: number, reason: string): Promise<any> => {
    const response = await api.post(`/revisions/${id}/reject`, { reason });
    return response.data;
  },
};

// Report services
export const reportService = {
  generate: async (reportType: string, filters: any): Promise<any> => {
    const response = await api.post('/reports/generate', { type: reportType, filters });
    return response.data;
  },

  export: async (reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> => {
    const response = await api.get(`/reports/${reportId}/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getHistory: async (): Promise<any[]> => {
    const response = await api.get('/reports/history');
    return response.data;
  },
};

export default api;
