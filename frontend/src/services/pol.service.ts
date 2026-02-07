import { apiClient } from './api';

interface POL {
  polId: string;
  poNumber: string;
  clientName: string;
  totalOrder: number;
  poDate: string;
  deliveryDate: string;
  status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
  createdBy: {
    userId: string;
    fullName: string;
  };
}

interface POLDetail {
  polDetailId: string;
  polId: string;
  productCode: string;
  productName: string;
  color: string | null;
  texture: string | null;
  material: string | null;
  size: string | null;
  finalSize: string | null;
  orderQuantity: number;
  extraBuffer: number;
  currentStage: string;
  productionProgress: number;
  materialRequirements: {
    clay: { type: string; quantity: number }[];
    glazes: string[];
    engobes: string[];
    lusters: string[];
    stainsOxides: string[];
  };
  toolRequirements: {
    castingTools: string[];
    extruders: string[];
    textures: string[];
    generalTools: string[];
  };
  buildNotes: string;
  createdAt: string;
  updatedAt: string;
}

interface CreatePOLRequest {
  clientName: string;
  deliveryDate: string;
  products: Array<{
    productCode: string;
    orderQuantity: number;
    extraBuffer?: number;
  }>;
}

interface UpdatePOLRequest {
  clientName?: string;
  deliveryDate?: string;
  status?: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
}

interface POLListResponse {
  pols: POL[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface POLDetailResponse {
  pol: POL;
  details: POLDetail[];
  activeAlerts: Array<{
    alertId: string;
    alertType: string;
    alertMessage: string;
    priority: string;
    createdAt: string;
  }>;
}

export const polService = {
  async getPOLs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    clientName?: string;
    poNumber?: string;
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<POLListResponse> {
    const response = await apiClient.get<POLListResponse>('/pols', params);
    return response;
  },

  async getPOLById(polId: string): Promise<POLDetailResponse> {
    const response = await apiClient.get<POLDetailResponse>(`/pols/${polId}`);
    return response;
  },

  async createPOL(data: CreatePOLRequest): Promise<POL> {
    const response = await apiClient.post<POL>('/pols', data);
    return response;
  },

  async updatePOL(polId: string, data: UpdatePOLRequest): Promise<POL> {
    const response = await apiClient.put<POL>(`/pols/${polId}`, data);
    return response;
  },

  async deletePOL(polId: string): Promise<void> {
    await apiClient.delete(`/pols/${polId}`);
  },

  async searchProducts(query: string, limit: number = 50): Promise<any> {
    const response = await apiClient.get('/products/search', {
      q: query,
      limit,
    });
    return response;
  },

  async getProductByCode(productCode: string): Promise<any> {
    const response = await apiClient.get(`/products/${productCode}`);
    return response;
  },

  async getProductMaterials(productCode: string): Promise<any> {
    const response = await apiClient.get(`/products/${productCode}/materials`);
    return response;
  },

  async getProductTools(productCode: string): Promise<any> {
    const response = await apiClient.get(`/products/${productCode}/tools`);
    return response;
  },

  async getProductBuildNotes(productCode: string): Promise<any> {
    const response = await apiClient.get(`/products/${productCode}/notes`);
    return response;
  },
};
