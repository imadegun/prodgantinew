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
    // Handle response structure: { success: true, data: { user, accessToken, refreshToken } }
    const responseData = response.data.data || response.data;
    const { accessToken, refreshToken, user } = responseData;
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      localStorage.setItem('refreshToken', refreshToken || '');
      localStorage.setItem('user', JSON.stringify(user));
    }
    return { token: accessToken, refreshToken, user };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data.data || response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await api.put('/auth/profile', userData);
    return response.data.data || response.data;
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
    // Backend returns { success, data: { pols: [...] }, meta: {...} }
    // Extract the pols array from the nested structure
    const responseData = response.data.data || response.data;
    return responseData.pols || responseData || [];
  },

  getById: async (id: number): Promise<POL> => {
    const response = await api.get(`/pols/${id}`);
    return response.data.data || response.data;
  },

  create: async (polData: Partial<POL>): Promise<POL> => {
    const response = await api.post('/pols', polData);
    return response.data.data || response.data;
  },

  update: async (id: number, polData: Partial<POL>): Promise<POL> => {
    const response = await api.put(`/pols/${id}`, polData);
    return response.data.data || response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/pols/${id}`);
  },

  updateStatus: async (id: number, status: POL['status']): Promise<POL> => {
    const response = await api.patch(`/pols/${id}/status`, { status });
    return response.data.data || response.data;
  },
};

// Product services (from gayafusionall)
export const productService = {
  search: async (query: string): Promise<any[]> => {
    const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`);
    // Backend returns { success, data: { products: [...] } }
    const responseData = response.data.data || response.data;
    return responseData.products || responseData || [];
  },

  getByCode: async (code: string): Promise<any> => {
    const response = await api.get(`/products/${code}`);
    // Backend returns { success, data: { product: {...} } }
    const responseData = response.data.data || response.data;
    return responseData.product || responseData;
  },

  getMaterialRequirements: async (productCode: string): Promise<any> => {
    const response = await api.get(`/products/${productCode}/materials`);
    // Backend returns { success, data: { materials: {...} } }
    const responseData = response.data.data || response.data;
    return responseData.materials || responseData;
  },

  getToolRequirements: async (productCode: string): Promise<any> => {
    const response = await api.get(`/products/${productCode}/tools`);
    // Backend returns { success, data: { tools: {...} } }
    const responseData = response.data.data || response.data;
    return responseData.tools || responseData;
  },
};

// Production services
export const productionService = {
  getRecords: async (polDetailId: number): Promise<any[]> => {
    const response = await api.get(`/production/${polDetailId}/records`);
    return response.data.data || response.data;
  },

  addRecord: async (polDetailId: number, recordData: any): Promise<any> => {
    const response = await api.post(`/production/${polDetailId}/records`, recordData);
    return response.data.data || response.data;
  },

  updateRecord: async (recordId: number, recordData: any): Promise<any> => {
    const response = await api.put(`/production/records/${recordId}`, recordData);
    return response.data.data || response.data;
  },

  getDecorationTasks: async (polDetailId: number): Promise<any[]> => {
    const response = await api.get(`/production/${polDetailId}/decorations`);
    return response.data.data || response.data;
  },

  addDecorationTask: async (polDetailId: number, taskData: any): Promise<any> => {
    const response = await api.post(`/production/${polDetailId}/decorations`, taskData);
    return response.data.data || response.data;
  },

  updateDecorationTask: async (taskId: number, taskData: any): Promise<any> => {
    const response = await api.put(`/production/decorations/${taskId}`, taskData);
    return response.data.data || response.data;
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
    // Backend returns { success, data: { alerts: [...] }, meta: {...} }
    const responseData = response.data.data || response.data;
    const alerts = responseData.alerts || responseData || [];
    // Transform alertId to id for frontend compatibility
    return alerts.map((alert: any) => ({
      ...alert,
      id: alert.alertId || alert.id
    }));
  },

  acknowledge: async (id: number): Promise<Alert> => {
    const response = await api.post(`/alerts/${id}/acknowledge`);
    return response.data.data || response.data;
  },

  resolve: async (id: number, notes: string): Promise<Alert> => {
    const response = await api.post(`/alerts/${id}/resolve`, { notes });
    return response.data.data || response.data;
  },

  getStats: async (): Promise<{ critical: number; warning: number; info: number }> => {
    const response = await api.get('/alerts/stats');
    // Backend returns { success, data: { critical_alerts, warning_alerts, info_alerts } }
    const responseData = response.data.data || response.data;
    return {
      critical: responseData.critical_alerts || responseData.critical || 0,
      warning: responseData.warning_alerts || responseData.warning || 0,
      info: responseData.info_alerts || responseData.info || 0,
    };
  },
};

// Dashboard services
export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/alerts/stats');
    // Backend returns { success, data: { total_pols, active_pols, completed_this_month, delayed_pols, critical_alerts, warning_alerts, info_alerts, ... } }
    const responseData = response.data.data || response.data;
    return {
      total_pols: responseData.total_pols || 0,
      active_pols: responseData.active_pols || 0,
      completed_this_month: responseData.completed_this_month || 0,
      delayed_pols: responseData.delayed_pols || 0,
      critical_alerts: responseData.critical_alerts || 0,
      warning_alerts: responseData.warning_alerts || 0,
      info_alerts: responseData.info_alerts || 0,
      pols_by_status: responseData.pols_by_status || [],
      production_progress: responseData.production_progress || [],
    };
  },

  getRecentPOLs: async (limit: number = 5): Promise<POL[]> => {
    const response = await api.get(`/pols?limit=${limit}`);
    // Backend returns { success, data: { pols: [...] }, meta: {...} }
    const responseData = response.data.data || response.data;
    return responseData.pols || responseData || [];
  },

  getUpcomingDeliveries: async (): Promise<any[]> => {
    const response = await api.get('/pols?status=IN_PROGRESS');
    // Backend returns { success, data: { pols: [...] }, meta: {...} }
    const responseData = response.data.data || response.data;
    return responseData.pols || responseData || [];
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
    // Backend returns { success, data: { entries: [...] }, meta: {...} }
    const responseData = response.data.data || response.data;
    const entries = responseData.entries || responseData || [];
    // Transform entryId to id for frontend compatibility
    return entries.map((entry: any) => ({
      ...entry,
      id: entry.entryId || entry.id
    }));
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/logbook/${id}`);
    return response.data.data || response.data;
  },

  create: async (entryData: any): Promise<any> => {
    const response = await api.post('/logbook', entryData);
    return response.data.data || response.data;
  },

  update: async (id: number, entryData: any): Promise<any> => {
    const response = await api.put(`/logbook/${id}`, entryData);
    return response.data.data || response.data;
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
    // Backend returns { success, data: { tickets: [...] }, meta: {...} }
    const responseData = response.data.data || response.data;
    const tickets = responseData.tickets || responseData || [];
    // Transform backend field names to frontend field names
    return tickets.map((ticket: any) => ({
      ...ticket,
      id: ticket.ticketId || ticket.id,
      type: ticket.revisionType || ticket.type,
    }));
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/revisions/${id}`);
    return response.data.data || response.data;
  },

  create: async (ticketData: any): Promise<any> => {
    const response = await api.post('/revisions', ticketData);
    return response.data.data || response.data;
  },

  update: async (id: number, ticketData: any): Promise<any> => {
    const response = await api.put(`/revisions/${id}`, ticketData);
    return response.data.data || response.data;
  },

  submit: async (id: number): Promise<any> => {
    const response = await api.post(`/revisions/${id}/submit`);
    return response.data.data || response.data;
  },

  approve: async (id: number): Promise<any> => {
    const response = await api.post(`/revisions/${id}/approve`);
    return response.data.data || response.data;
  },

  reject: async (id: number, reason: string): Promise<any> => {
    const response = await api.post(`/revisions/${id}/reject`, { reason });
    return response.data.data || response.data;
  },
};

// Report services
export const reportService = {
  generate: async (reportType: string, filters: any): Promise<any> => {
    const response = await api.post('/reports/generate', { type: reportType, filters });
    return response.data.data || response.data;
  },

  export: async (reportId: string, format: 'pdf' | 'excel' | 'csv'): Promise<Blob> => {
    const response = await api.get(`/reports/${reportId}/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  getHistory: async (): Promise<any[]> => {
    const response = await api.get('/reports/history');
    return response.data.data || response.data;
  },
};

export default api;
