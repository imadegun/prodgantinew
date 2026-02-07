import { apiClient } from './api';

interface Alert {
  alertId: string;
  polDetailId: string;
  polNumber: string;
  productCode: string;
  productName: string;
  alertType: string;
  alertMessage: string;
  priority: 'CRITICAL' | 'WARNING' | 'INFORMATIONAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

interface AlertListQuery {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  polDetailId?: string;
}

interface AlertListResponse {
  alerts: Alert[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

interface ResolveAlertRequest {
  resolutionNotes?: string;
}

export const alertService = {
  async getAlerts(params?: AlertListQuery): Promise<AlertListResponse> {
    const response = await apiClient.get<AlertListResponse>('/alerts', params);
    return response;
  },

  async acknowledgeAlert(alertId: string): Promise<Alert> {
    const response = await apiClient.put<Alert>(`/alerts/${alertId}/acknowledge`, {});
    return response;
  },

  async resolveAlert(alertId: string, data: ResolveAlertRequest): Promise<Alert> {
    const response = await apiClient.put<Alert>(`/alerts/${alertId}/resolve`, data);
    return response;
  },

  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<{ unreadCount: number }>('/alerts/unread-count');
    return response.unreadCount;
  },
};
