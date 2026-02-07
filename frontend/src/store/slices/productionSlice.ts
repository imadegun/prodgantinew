import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';

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

interface ProductionState {
  productionStages: ProductionStage[];
  activeTasks: ActiveProductionTask[];
  isLoading: boolean;
  isTracking: boolean;
  error: string | null;
  currentPolDetailId: string | null;
}

const initialState: ProductionState = {
  productionStages: [],
  activeTasks: [],
  isLoading: false,
  isTracking: false,
  error: null,
  currentPolDetailId: null,
};

export const fetchProductionStages = createAsyncThunk(
  'production/fetchStages',
  async (polDetailId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ProductionStagesResponse>(
        `/production/${polDetailId}/stages`
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch production stages'
      );
    }
  }
);

export const trackProduction = createAsyncThunk(
  'production/track',
  async (data: TrackProductionRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<TrackProductionResponse>(
        '/production/track',
        data
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to track production'
      );
    }
  }
);

export const fetchActiveProduction = createAsyncThunk(
  'production/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ActiveProductionResponse>(
        '/production/active'
      );
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch active production'
      );
    }
  }
);

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPolDetailId: (state, action: PayloadAction<string>) => {
      state.currentPolDetailId = action.payload;
    },
    clearProductionStages: (state) => {
      state.productionStages = [];
      state.currentPolDetailId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProductionStages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProductionStages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.productionStages = action.payload.stages;
        state.currentPolDetailId = action.payload.polDetailId;
      })
      .addCase(fetchProductionStages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(trackProduction.pending, (state) => {
        state.isTracking = true;
        state.error = null;
      })
      .addCase(trackProduction.fulfilled, (state, action) => {
        state.isTracking = false;
        // Update production stages if tracking same pol detail
        if (state.currentPolDetailId) {
          const updatedStages = state.productionStages.map((stage) => {
            if (stage.stage === action.payload.stage) {
              return {
                ...stage,
                quantity: action.payload.quantity,
                rejectQuantity: action.payload.rejectQuantity || 0,
                remakeCycle: action.payload.remakeCycle || 0,
                completedAt: new Date().toISOString(),
                notes: action.payload.notes || '',
                isComplete: true,
                canTransition: true,
              };
            }
            return stage;
          });
          state.productionStages = updatedStages;
        }
      })
      .addCase(trackProduction.rejected, (state, action) => {
        state.isTracking = false;
        state.error = action.payload as string;
      })
      .addCase(fetchActiveProduction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchActiveProduction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeTasks = action.payload.tasks;
      })
      .addCase(fetchActiveProduction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentPolDetailId, clearProductionStages } = productionSlice.actions;
export default productionSlice.reducer;
