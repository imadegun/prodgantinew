import { apiClient } from './api';

export interface StageCategory {
  id: number;
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
  id: number;
  code: string;
  name: string;
  categoryId: number;
  sortOrder: number;
  isActive: boolean;
  requiresOven: boolean;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  category?: StageCategory;
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
  categoryId: number;
  sortOrder?: number;
  requiresOven?: boolean;
  description?: string;
}

export interface UpdateStageRequest {
  name?: string;
  categoryId?: number;
  sortOrder?: number;
  isActive?: boolean;
  requiresOven?: boolean;
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
    return apiClient.get<StageCategory[]>('/stages/categories');
  }

  async getCategoryById(id: number): Promise<StageCategory> {
    return apiClient.get<StageCategory>(`/stages/categories/${id}`);
  }

  async createCategory(data: CreateCategoryRequest): Promise<StageCategory> {
    return apiClient.post<StageCategory>('/stages/categories', data);
  }

  async updateCategory(id: number, data: UpdateCategoryRequest): Promise<StageCategory> {
    return apiClient.put<StageCategory>(`/stages/categories/${id}`, data);
  }

  async deleteCategory(id: number): Promise<void> {
    return apiClient.delete<void>(`/stages/categories/${id}`);
  }

  // Stages
  async getStages(): Promise<ProductionStage[]> {
    return apiClient.get<ProductionStage[]>('/stages');
  }

  async getStagesByCategory(categoryId: number): Promise<ProductionStage[]> {
    return apiClient.get<ProductionStage[]>(`/stages/category/${categoryId}`);
  }

  async getStageById(id: number): Promise<ProductionStage> {
    return apiClient.get<ProductionStage>(`/stages/${id}`);
  }

  async createStage(data: CreateStageRequest): Promise<ProductionStage> {
    return apiClient.post<ProductionStage>('/stages', data);
  }

  async updateStage(id: number, data: UpdateStageRequest): Promise<ProductionStage> {
    return apiClient.put<ProductionStage>(`/stages/${id}`, data);
  }

  async deleteStage(id: number): Promise<void> {
    return apiClient.delete<void>(`/stages/${id}`);
  }

  // Mappings
  async getStageMapping(): Promise<StageMapping> {
    return apiClient.get<StageMapping>('/stages/mapping/stages');
  }

  async getCategoryMapping(): Promise<CategoryMapping> {
    return apiClient.get<CategoryMapping>('/stages/mapping/categories');
  }
}

export const stageService = new StageService();
