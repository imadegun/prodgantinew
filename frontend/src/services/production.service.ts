import { apiClient } from './api';

interface ProductionStage {
  stage: string;
  displayName: string;
  quantity: number;
  rejectQuantity: number;
  remakeCycle: number;
  completedAt: string;
  completedBy: {
    userId: string;
    fullName: string;
  };
  notes: string;
  isComplete: boolean;
  canTransition: boolean;
}

interface ProductionStagesResponse {
  polDetailId: string;
  productCode: string;
  productName: string;
  orderQuantity: number;
  currentStage: string;
  stages: ProductionStage[];
}

interface TrackProductionRequest {
  polDetailId: string;
  stage: string;
  quantity: number;
  rejectQuantity?: number;
  remakeCycle?: number;
  notes?: string;
}

interface TrackProductionResponse {
  recordId: string;
  stage: string;
  quantity: number;
  rejectQuantity: number;
  remakeCycle: number;
  notes?: string;
  createdAt: string;
  discrepancyDetected: boolean;
  alerts?: Array<{
    alertId: string;
    alertType: string;
    alertMessage: string;
    priority: string;
  }>;
}

interface ActiveProductionTask {
  polDetailId: string;
  polNumber: string;
  productCode: string;
  productName: string;
  currentStage: string;
  displayName: string;
  pendingQuantity: number;
  deliveryDate: string;
  urgency: 'NORMAL' | 'URGENT' | 'CRITICAL';
}

interface ActiveProductionResponse {
  tasks: ActiveProductionTask[];
}

interface DecorationTask {
  taskId: string;
  taskName: string;
  taskDescription: string;
  quantityRequired: number;
  quantityCompleted: number;
  quantityRejected: number;
  status: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface DecorationTasksResponse {
  polDetailId: string;
  tasks: DecorationTask[];
}

interface TrackDecorationTaskRequest {
  taskId: string;
  quantityCompleted?: number;
  quantityRejected?: number;
  notes?: string;
}

export const productionService = {
  async getProductionStages(polDetailId: string): Promise<ProductionStagesResponse> {
    const response = await apiClient.get<ProductionStagesResponse>(
      `/production/${polDetailId}/stages`
    );
    return response;
  },

  async trackProduction(data: TrackProductionRequest): Promise<TrackProductionResponse> {
    const response = await apiClient.post<TrackProductionResponse>(
      '/production/track',
      data
    );
    return response;
  },

  async getActiveProduction(): Promise<ActiveProductionResponse> {
    const response = await apiClient.get<ActiveProductionResponse>('/production/active');
    return response;
  },

  async getDecorationTasks(polDetailId: string): Promise<DecorationTasksResponse> {
    const response = await apiClient.get<DecorationTasksResponse>(
      `/decorations/${polDetailId}`
    );
    return response;
  },

  async createDecorationTask(data: {
    polDetailId: string;
    taskName: string;
    taskDescription?: string;
    quantityRequired: number;
    notes?: string;
  }): Promise<DecorationTask> {
    const response = await apiClient.post<DecorationTask>('/decorations', data);
    return response;
  },

  async updateDecorationTask(taskId: string, data: TrackDecorationTaskRequest): Promise<DecorationTask> {
    const response = await apiClient.put<DecorationTask>(`/decorations/${taskId}`, data);
    return response;
  },

  async deleteDecorationTask(taskId: string): Promise<void> {
    await apiClient.delete(`/decorations/${taskId}`);
  },
};
