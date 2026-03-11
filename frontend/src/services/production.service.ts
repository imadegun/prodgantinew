import { apiClient } from './api';

interface ProductionStage {
  stage: string;
  displayName: string;
  quantity: number;
  rejectQuantity: number;
  remakeCycle: number;
  completedAt: string;
  completedBy: {
    userId: number;
    fullName: string;
  };
  notes: string;
  isComplete: boolean;
  canTransition: boolean;
}

interface ProductionStagesResponse {
  polDetailId: number;
  productCode: string;
  productName: string;
  orderQuantity: number;
  qtyToMake: number;
  currentStage: string;
  stages: ProductionStage[];
  workflow?: {
    workflowType: 'THROWING' | 'HANDBUILD' | 'SLAB';
    skipHighFiring: boolean;
    hasLusterFiring: boolean;
    firingType: string | null;
    summary: string;
    stages: string[];
  };
}

interface ProductProductionInfo {
  productCode: string;
  buildTech: string | null;
  buildTechNote: string | null;
  clayId: number | null;
  clayCode: string | null;
  clayDescription: string | null;
  clayKG: number | null;
  clayNote: string | null;
  hasLuster: boolean;
  lustre1: { id: number; code: string; description: string } | null;
  lustre2: { id: number; code: string; description: string } | null;
  lustre3: { id: number; code: string; description: string } | null;
  lustre4: { id: number; code: string; description: string } | null;
  lustreTemp: number | null;
  firing: string | null;
  firingNote: string | null;
  glaze1: { id: number; code: string; description: string } | null;
  glaze2: { id: number; code: string; description: string } | null;
  glaze3: { id: number; code: string; description: string } | null;
  glaze4: { id: number; code: string; description: string } | null;
  glazeTemp: number | null;
  engobe1: { id: number; code: string; description: string } | null;
  engobe2: { id: number; code: string; description: string } | null;
  engobe3: { id: number; code: string; description: string } | null;
  engobe4: { id: number; code: string; description: string } | null;
  width: number | null;
  height: number | null;
  length: number | null;
  diameter: number | null;
}

interface TrackProductionRequest {
  polDetailId: number;
  stage: string;
  quantity: number;
  rejectQuantity?: number;
  remakeCycle?: number;
  category?: string;
  remakeType?: string;
  ovenId?: number;
  operatorId?: number;
  rejectReasonId?: number;
  notes?: string;
  productionDate?: string;
}

interface TrackProductionResponse {
  recordId: number;
  stage: string;
  quantity: number;
  rejectQuantity: number;
  remakeCycle: number;
  notes?: string;
  createdAt: string;
  discrepancyDetected: boolean;
  alerts?: Array<{
    alertId: number;
    alertType: string;
    alertMessage: string;
    priority: string;
  }>;
}

interface ActiveProductionTask {
  polDetailId: number;
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
  taskId: number;
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
  polDetailId: number;
  tasks: DecorationTask[];
}

interface TrackDecorationTaskRequest {
  taskId: number;
  quantityCompleted?: number;
  quantityRejected?: number;
  notes?: string;
  status?: string;
}

export const productionService = {
  async getProductionStages(polDetailId: number): Promise<ProductionStagesResponse> {
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

  async getDecorationTasks(polDetailId: number): Promise<DecorationTasksResponse> {
    const response = await apiClient.get<DecorationTasksResponse>(
      `/production/decorations/${polDetailId}`
    );
    return response;
  },

  async createDecorationTask(data: {
    polDetailId: number;
    taskName: string;
    taskDescription?: string;
    quantityRequired: number;
    notes?: string;
  }): Promise<DecorationTask> {
    const response = await apiClient.post<DecorationTask>('/production/decorations', data);
    return response;
  },

  async updateDecorationTask(taskId: number, data: TrackDecorationTaskRequest): Promise<DecorationTask> {
    const response = await apiClient.put<DecorationTask>(`/production/decorations/${taskId}`, data);
    return response;
  },

  async deleteDecorationTask(taskId: number): Promise<void> {
    await apiClient.delete(`/production/decorations/${taskId}`);
  },

  // Get all ovens
  async getOvens(): Promise<Array<{
    id: number;
    ovenCode: string;
    ovenName: string;
    capacity: number;
    status: string;
  }>> {
    const response = await apiClient.get('/production/ovens');
    return response.data;
  },

  // Get all defect reasons
  async getDefectReasons(): Promise<Array<{
    id: number;
    reasonName: string;
    category: string;
    description: string;
  }>> {
    const response = await apiClient.get('/production/defect-reasons');
    return response.data;
  },

  // Get product parts for a POL detail
  async getProductParts(polDetailId: number): Promise<Array<{
    id: number;
    partName: string;
    partType: string;
    linkedToPartId: number | null;
    throwingRequired: boolean;
    throwingOrder: number | null;
  }>> {
    const response = await apiClient.get(`/production/product-parts/${polDetailId}`);
    return response.data;
  },

  // Create a product part
  async createProductPart(data: {
    polDetailId: number;
    partName: string;
    partType?: string;
    linkedToPartId?: number;
    throwingRequired?: boolean;
    throwingOrder?: number;
  }): Promise<any> {
    const response = await apiClient.post('/production/product-parts', data);
    return response.data;
  },

  // Get remake cycles for a POL detail
  async getRemakeCycles(polDetailId: number): Promise<Array<{
    id: number;
    remakeNumber: number;
    remakeType: string;
    rejectStage: string | null;
    rejectCategory: string | null;
    rejectQuantity: number;
    status: string;
    createdAt: string;
    rejectReason: {
      id: number;
      reasonName: string;
    } | null;
  }>> {
    const response = await apiClient.get(`/production/remake-cycles/${polDetailId}`);
    return response.data;
  },

  // Create a remake cycle
  async createRemakeCycle(data: {
    polDetailId: number;
    originalRecordId?: number;
    remakeNumber: number;
    remakeType: string;
    rejectStage?: string;
    rejectCategory?: string;
    rejectReasonId?: number;
    rejectQuantity: number;
  }): Promise<{ cycle: any; isEscalated: boolean }> {
    const response = await apiClient.post('/production/remake-cycles', data);
    return response.data;
  },

  // Get stages by product type
  async getStagesByProductType(productType: string): Promise<string[]> {
    const response = await apiClient.get(`/production/stages-by-product-type/${productType}`);
    return response.data;
  },

  // Get operators (users)
  async getOperators(): Promise<Array<{
    id: number;
    username: string;
    fullName: string;
    role: string;
  }>> {
    const response = await apiClient.get('/production/operators');
    return response.data;
  },

  // Get production info (BuildTech, Clay, Luster, etc.)
  async getProductProductionInfo(productCode: string): Promise<ProductProductionInfo> {
    const response = await apiClient.get<any>(
      `/products/${productCode}/production-info`
    );
    return response.data;
  },

  // Get production workflow (determines stages based on product specs)
  async getProductWorkflow(productCode: string): Promise<{
    workflowType: 'THROWING' | 'HANDBUILD' | 'SLAB';
    skipHighFiring: boolean;
    hasLusterFiring: boolean;
    firingType: string | null;
    summary: string;
    stages: string[];
  }> {
    const response = await apiClient.get<any>(
      `/products/${productCode}/workflow`
    );
    return response.data;
  },
};
