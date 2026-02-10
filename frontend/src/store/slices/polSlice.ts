import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';

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

interface POLListQuery {
  page?: number;
  limit?: number;
  status?: string;
  clientName?: string;
  poNumber?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: string;
}

interface POLState {
  pols: POL[];
  currentPOL: POL | null;
  currentPOLDetails: POLDetail[];
  isLoading: boolean;
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
  };
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: POLState = {
  pols: [],
  currentPOL: null,
  currentPOLDetails: [],
  isLoading: false,
  loading: false,
  error: null,
  filters: {
    status: 'All',
  },
  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const fetchPOLs = createAsyncThunk(
  'pol/fetchPOLs',
  async (params: POLListQuery, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{
        pols: POL[];
        meta: POLState['meta'];
      }>('/pols', params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch POLs');
    }
  }
);

export const fetchPOLById = createAsyncThunk(
  'pol/fetchPOLById',
  async (polId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<{
        pol: POL;
        details: POLDetail[];
      }>(`/pols/${polId}`);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch POL');
    }
  }
);

export const createPOL = createAsyncThunk(
  'pol/createPOL',
  async (data: {
    clientName: string;
    deliveryDate: string;
    products: Array<{
      productCode: string;
      orderQuantity: number;
      extraBuffer?: number;
    }>;
  }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<POL>('/pols', data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to create POL');
    }
  }
);

export const updatePOL = createAsyncThunk(
  'pol/updatePOL',
  async ({ polId, data }: { polId: string; data: Partial<POL> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<POL>(`/pols/${polId}`, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to update POL');
    }
  }
);

export const deletePOL = createAsyncThunk(
  'pol/deletePOL',
  async (polId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/pols/${polId}`);
      return polId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || 'Failed to delete POL');
    }
  }
);

const polSlice = createSlice({
  name: 'pol',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPOL: (state, action: PayloadAction<POL>) => {
      state.currentPOL = action.payload;
    },
    clearCurrentPOL: (state) => {
      state.currentPOL = null;
      state.currentPOLDetails = [];
    },
    setFilters: (state, action: PayloadAction<Partial<POLState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPOLs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPOLs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pols = action.payload.pols;
        state.meta = action.payload.meta;
      })
      .addCase(fetchPOLs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPOLById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPOLById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPOL = action.payload.pol;
        state.currentPOLDetails = action.payload.details;
      })
      .addCase(fetchPOLById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPOL.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPOL.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pols.unshift(action.payload);
      })
      .addCase(createPOL.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updatePOL.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePOL.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.pols.findIndex((pol) => pol.polId === action.payload.polId);
        if (index !== -1) {
          state.pols[index] = action.payload;
        }
        if (state.currentPOL?.polId === action.payload.polId) {
          state.currentPOL = action.payload;
        }
      })
      .addCase(updatePOL.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deletePOL.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePOL.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pols = state.pols.filter((pol) => pol.polId !== action.payload);
        if (state.currentPOL?.polId === action.payload) {
          state.currentPOL = null;
          state.currentPOLDetails = [];
        }
      })
      .addCase(deletePOL.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPOL, clearCurrentPOL, setFilters } = polSlice.actions;
export default polSlice.reducer;
