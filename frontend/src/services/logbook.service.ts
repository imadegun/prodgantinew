import { apiClient } from './api';

interface LogbookEntry {
  id: string;
  polId?: string;
  entryDate: string;
  status: 'NORMAL' | 'ISSUES' | 'RESOLVED';
  issues?: string;
  actions?: string;
  notes?: string;
  userId: string;
  createdAt?: string;
}

interface LogbookListQuery {
  page?: number;
  limit?: number;
  status?: string;
  severity?: string;
  polId?: string;
}

interface LogbookListResponse {
  entries: LogbookEntry[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CreateLogbookEntryRequest {
  polId?: string;
  entryDate: string;
  status: 'NORMAL' | 'ISSUES' | 'RESOLVED';
  issues?: string;
  actions?: string;
  notes?: string;
  userId?: string;
}

export const logbookService = {
  async getAll(params?: LogbookListQuery): Promise<LogbookListResponse> {
    const response = await apiClient.get<LogbookListResponse>('/logbook', params);
    return response;
  },

  async create(data: CreateLogbookEntryRequest): Promise<LogbookEntry> {
    const response = await apiClient.post<LogbookEntry>('/logbook', data);
    return response;
  },

  async getById(id: string): Promise<LogbookEntry> {
    const response = await apiClient.get<LogbookEntry>(`/logbook/${id}`);
    return response;
  },

  async update(id: string, data: Partial<CreateLogbookEntryRequest>): Promise<LogbookEntry> {
    const response = await apiClient.put<LogbookEntry>(`/logbook/${id}`, data);
    return response;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/logbook/${id}`);
  },
};
