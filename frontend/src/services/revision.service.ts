import { apiClient } from './api';
import { RevisionTicket } from '../types';

interface CreateRevisionTicketRequest {
  polId?: string;
  type: 'DESIGN' | 'PRODUCTION' | 'MATERIAL' | 'OTHER';
  issueType?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  proposedSolution?: string;
  createdBy?: string;
}

export const revisionService = {
  async getAll(filters?: {
    status?: string;
    type?: string;
  }): Promise<RevisionTicket[]> {
    const response = await apiClient.get<RevisionTicket[]>('/revision-tickets', filters);
    return response;
  },

  async getById(ticketId: string): Promise<RevisionTicket> {
    const response = await apiClient.get<RevisionTicket>(`/revision-tickets/${ticketId}`);
    return response;
  },

  async create(data: CreateRevisionTicketRequest): Promise<RevisionTicket> {
    const response = await apiClient.post<RevisionTicket>('/revision-tickets', data);
    return response;
  },

  async submit(ticketId: number): Promise<RevisionTicket> {
    const response = await apiClient.post<RevisionTicket>(`/revision-tickets/${ticketId}/submit`, {});
    return response;
  },

  async approve(ticketId: number): Promise<RevisionTicket> {
    const response = await apiClient.post<RevisionTicket>(`/revision-tickets/${ticketId}/approve`, {});
    return response;
  },

  async reject(ticketId: number, reason: string): Promise<RevisionTicket> {
    const response = await apiClient.post<RevisionTicket>(`/revision-tickets/${ticketId}/reject`, { reason });
    return response;
  },

  async update(ticketId: string, data: Partial<CreateRevisionTicketRequest>): Promise<RevisionTicket> {
    const response = await apiClient.put<RevisionTicket>(`/revision-tickets/${ticketId}`, data);
    return response;
  },

  async delete(ticketId: string): Promise<void> {
    await apiClient.delete(`/revision-tickets/${ticketId}`);
  },
};
