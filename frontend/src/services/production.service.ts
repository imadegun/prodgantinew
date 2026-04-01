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
  polDetailId: string;
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
  polDetailId: string;
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
  escalationNotes?: string;
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
  polDetailId: string;
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
      `/production/decorations/${polDetailId}`
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
    const response = await apiClient.get<Array<{
      id: number;
      ovenCode: string;
      ovenName: string;
      capacity: number;
      status: string;
    }>>('/production/ovens');
    return response;
  },

  // Get all defect reasons (active only)
  async getDefectReasons(): Promise<Array<{
    id: number;
    category: string;
    description: string;
  }>> {
    const response = await apiClient.get<Array<{
      id: number;
      category: string;
      description: string;
    }>>('/production/defect-reasons');
    return response;
  },

  // Get all defect reasons including inactive (for management)
  async getAllDefectReasons(): Promise<Array<{
    id: number;
    category: string;
    description: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string | null;
  }>> {
    const response = await apiClient.get<Array<{
      id: number;
      category: string;
      description: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string | null;
    }>>('/production/defect-reasons/all');
    return response;
  },

  // Create a new defect reason
  async createDefectReason(data: {
    category: string;
    description: string;
  }): Promise<{
    id: number;
    category: string;
    description: string;
    isActive: boolean;
  }> {
    const response = await apiClient.post<{
      id: number;
      category: string;
      description: string;
      isActive: boolean;
    }>('/production/defect-reasons', data);
    return response;
  },

  // Update a defect reason
  async updateDefectReason(id: number, data: {
    category?: string;
    description?: string;
    isActive?: boolean;
  }): Promise<{
    id: number;
    category: string;
    description: string;
    isActive: boolean;
  }> {
    const response = await apiClient.put<{
      id: number;
      category: string;
      description: string;
      isActive: boolean;
    }>(`/production/defect-reasons/${id}`, data);
    return response;
  },

  // Delete (deactivate) a defect reason
  async deleteDefectReason(id: number): Promise<void> {
    await apiClient.delete(`/production/defect-reasons/${id}`);
  },

  // Get product parts for a POL detail
  async getProductParts(polDetailId: string): Promise<Array<{
    id: number;
    partName: string;
    partType: string;
    linkedToPartId: number | null;
    throwingRequired: boolean;
    throwingOrder: number | null;
  }>> {
    const response = await apiClient.get<Array<{
      id: number;
      partName: string;
      partType: string;
      linkedToPartId: number | null;
      throwingRequired: boolean;
      throwingOrder: number | null;
    }>>(`/production/product-parts/${polDetailId}`);
    return response;
  },

  // Create a product part
  async createProductPart(data: {
    polDetailId: string;
    partName: string;
    partType?: string;
    linkedToPartId?: number;
    throwingRequired?: boolean;
    throwingOrder?: number;
  }): Promise<any> {
    const response = await apiClient.post<any>('/production/product-parts', data);
    return response;
  },

  // Update a product part
  async updateProductPart(id: number, data: {
    partName?: string;
    partType?: string;
    linkedToPartId?: number;
    throwingRequired?: boolean;
    throwingOrder?: number;
  }): Promise<any> {
    const response = await apiClient.put<any>(`/production/product-parts/${id}`, data);
    return response;
  },

  // Delete a product part
  async deleteProductPart(id: number): Promise<void> {
    await apiClient.delete(`/production/product-parts/${id}`);
  },

  // Get production stages for a specific product part
  async getPartProductionStages(partId: number): Promise<any> {
    const response = await apiClient.get<any>(`/production/product-parts/${partId}/stages`);
    return response;
  },

  // Track production for a specific product part
  async trackPartProduction(data: {
    polDetailId: string;
    partId: number;
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
    escalationNotes?: string;
  }): Promise<any> {
    const response = await apiClient.post<any>('/production/track-part', data);
    return response;
  },

  // Get remake cycles for a POL detail
  async getRemakeCycles(polDetailId: string): Promise<Array<{
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
      category: string;
    } | null;
  }>> {
    const response = await apiClient.get<Array<{
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
        category: string;
      } | null;
    }>>(`/production/remake-cycles/${polDetailId}`);
    return response;
  },

  // Create a remake cycle
  async createRemakeCycle(data: {
    polDetailId: string;
    originalRecordId?: number;
    remakeNumber: number;
    remakeType: string;
    rejectStage?: string;
    rejectCategory?: string;
    rejectReasonId?: number;
    rejectQuantity: number;
  }): Promise<{ cycle: any; isEscalated: boolean }> {
    const response = await apiClient.post<{ cycle: any; isEscalated: boolean }>('/production/remake-cycles', data);
    return response;
  },

  // Get stages by product type
  async getStagesByProductType(productType: string): Promise<string[]> {
    const response = await apiClient.get<string[]>(`/production/stages-by-product-type/${productType}`);
    return response;
  },

  // Get operators (users)
  async getOperators(): Promise<Array<{
    id: number;
    username: string;
    fullName: string;
    role: string;
  }>> {
    const response = await apiClient.get<Array<{
      id: number;
      username: string;
      fullName: string;
      role: string;
    }>>('/production/operators');
    return response;
  },

  // Get production info (BuildTech, Clay, Luster, etc.)
  async getProductProductionInfo(productCode: string): Promise<ProductProductionInfo> {
    const response = await apiClient.get<ProductProductionInfo>(
      `/products/${productCode}/production-info`
    );
    return response;
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
    const response = await apiClient.get<{
      workflowType: 'THROWING' | 'HANDBUILD' | 'SLAB';
      skipHighFiring: boolean;
      hasLusterFiring: boolean;
      firingType: string | null;
      summary: string;
      stages: string[];
    }>(
      `/products/${productCode}/workflow`
    );
    return response;
  },

  // Combine parts at any stage
  async combineParts(data: {
    polDetailId: string;
    stage: string;
    parts: Array<{ partId: number; quantity: number }>;
    notes?: string;
  }): Promise<any> {
    const response = await apiClient.post<any>('/production/combine-parts', data);
    return response;
  },

  // Get part combinations for a POL detail
  async getPartCombinations(polDetailId: string): Promise<Array<{
    id: number;
    combinedAtStage: string;
    combinedQuantity: number;
    notes: string | null;
    createdAt: string;
    combinedByUser: {
      id: number;
      fullName: string;
      username: string;
    };
    combinationItems: Array<{
      id: number;
      quantityUsed: number;
      part: {
        id: number;
        partName: string;
        partType: string;
      };
    }>;
  }>> {
    const response = await apiClient.get<Array<{
      id: number;
      combinedAtStage: string;
      combinedQuantity: number;
      notes: string | null;
      createdAt: string;
      combinedByUser: {
        id: number;
        fullName: string;
        username: string;
      };
      combinationItems: Array<{
        id: number;
        quantityUsed: number;
        part: {
          id: number;
          partName: string;
          partType: string;
        };
      }>;
    }>>(`/production/part-combinations/${polDetailId}`);
    return response;
  },
};
