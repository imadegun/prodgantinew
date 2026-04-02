import { apiClient } from './api';

export interface StageCategory {
  id: string;
  code: string;
  name: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  stages: ProductionStage[];
}

export interface ProductionStage {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  sortOrder: number;
  isActive: boolean;
  requiresOven: boolean;
  hasDetailProcess: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    code: string;
    name: string;
    color: string;
  };
}

export interface StageDetailProcess {
  id: string;
  stageId: string;
  processName: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryRequest {
  code: string;
  name: string;
  color: string;
  sortOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateStageRequest {
  code: string;
  name: string;
  categoryId: string;
  sortOrder?: number;
  requiresOven?: boolean;
  hasDetailProcess?: boolean;
  description?: string;
}

export interface UpdateStageRequest {
  name?: string;
  categoryId?: string;
  sortOrder?: number;
  isActive?: boolean;
  requiresOven?: boolean;
  hasDetailProcess?: boolean;
  description?: string;
}

export interface StageMapping {
  [code: string]: string;
}

export interface CategoryMapping {
  [code: string]: {
    name: string;
    color: string;
  };
}

class StageService {
  // Categories
  async getCategories(): Promise<StageCategory[]> {
    // apiClient.get already returns response.data.data, so we get the array directly
    const response = await apiClient.get<StageCategory[]>('/stages/categories');
    return response || [];
  }

  async getCategoryById(id: string): Promise<StageCategory> {
    const response = await apiClient.get<StageCategory>(`/stages/categories/${id}`);
    return response;
  }

  async createCategory(data: CreateCategoryRequest): Promise<StageCategory> {
    const response = await apiClient.post<StageCategory>('/stages/categories', data);
    return response;
  }

  async updateCategory(id: string, data: UpdateCategoryRequest): Promise<StageCategory> {
    const response = await apiClient.put<StageCategory>(`/stages/categories/${id}`, data);
    return response;
  }

  async deleteCategory(id: string): Promise<void> {
    return apiClient.delete<void>(`/stages/categories/${id}`);
  }

  // Stages
  async getStages(): Promise<ProductionStage[]> {
    // apiClient.get already returns response.data.data, so we get the array directly
    const response = await apiClient.get<ProductionStage[]>('/stages');
    return response || [];
  }

  async getStagesByCategory(categoryId: string): Promise<ProductionStage[]> {
    // apiClient.get already returns response.data.data, so we get the array directly
    const response = await apiClient.get<ProductionStage[]>(`/stages/by-category/${categoryId}`);
    return response || [];
  }

  async getStageById(id: string): Promise<ProductionStage> {
    const response = await apiClient.get<ProductionStage>(`/stages/${id}`);
    return response;
  }

  async createStage(data: CreateStageRequest): Promise<ProductionStage> {
    const response = await apiClient.post<ProductionStage>('/stages', data);
    return response;
  }

  async updateStage(id: string, data: UpdateStageRequest): Promise<ProductionStage> {
    const response = await apiClient.put<ProductionStage>(`/stages/${id}`, data);
    return response;
  }

  async deleteStage(id: string): Promise<void> {
    return apiClient.delete<void>(`/stages/${id}`);
  }

  // Mappings
  async getStageMapping(): Promise<StageMapping> {
    const response = await apiClient.get<StageMapping>('/stages/mapping/stages');
    return response;
  }

  async getCategoryMapping(): Promise<CategoryMapping> {
    const response = await apiClient.get<CategoryMapping>('/stages/mapping/categories');
    return response;
  }

  // Stage Detail Processes
  async getProcessesByStageId(stageId: string): Promise<StageDetailProcess[]> {
    const response = await apiClient.get<StageDetailProcess[]>(`/stage-detail-processes/stages/${stageId}/processes`);
    return response || [];
  }

  async createProcess(stageId: string, data: { processName: string; sortOrder?: number }): Promise<StageDetailProcess> {
    const response = await apiClient.post<StageDetailProcess>(`/stage-detail-processes/stages/${stageId}/processes`, data);
    return response;
  }

  async updateProcess(id: string, data: { processName?: string; sortOrder?: number; isActive?: boolean }): Promise<StageDetailProcess> {
    const response = await apiClient.put<StageDetailProcess>(`/stage-detail-processes/processes/${id}`, data);
    return response;
  }

  async deleteProcess(id: string): Promise<void> {
    return apiClient.delete<void>(`/stage-detail-processes/processes/${id}`);
  }

  async bulkCreateProcesses(stageId: string, processes: { processName: string; sortOrder?: number }[]): Promise<StageDetailProcess[]> {
    const response = await apiClient.post<StageDetailProcess[]>(`/stage-detail-processes/stages/${stageId}/processes/bulk`, { processes });
    return response || [];
  }
}

export const stageService = new StageService();
