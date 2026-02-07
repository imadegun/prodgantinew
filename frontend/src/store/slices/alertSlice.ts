import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';

interface Alert {
  alertId: string;
  polDetailId: string;
  polNumber: string;
  productCode: string;
  productName: string;
  alertType: string;
  alertMessage: string;
  priority: 'CRITICAL' | 'WARNING' | 'INFORMATIONAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  createdAt: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
}

interface AlertListQuery {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  polDetailId?: string;
}

interface AlertListResponse {
  alerts: Alert[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

interface ResolveAlertRequest {
  resolutionNotes?: string;
}

interface AlertState {
  alerts: Alert[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: AlertState = {
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const fetchAlerts = createAsyncThunk(
  'alerts/fetchAlerts',
  async (params: AlertListQuery, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<AlertListResponse>('/alerts', params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch alerts'
      );
    }
  }
);

export const acknowledgeAlert = createAsyncThunk(
  'alerts/acknowledge',
  async (alertId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<Alert>(`/alerts/${alertId}/acknowledge`, {});
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to acknowledge alert'
      );
    }
  }
);

export const resolveAlert = createAsyncThunk(
  'alerts/resolve',
  async ({ alertId, data }: { alertId: string; data: ResolveAlertRequest }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<Alert>(`/alerts/${alertId}/resolve`, data);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to resolve alert'
      );
    }
  }
);

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    markAlertAsRead: (state, action: PayloadAction<string>) => {
      const alert = state.alerts.find((a) => a.alertId === action.payload);
      if (alert && alert.status === 'OPEN') {
        alert.status = 'ACKNOWLEDGED';
        alert.acknowledgedAt = new Date().toISOString();
        if (state.unreadCount > 0) {
          state.unreadCount--;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAlerts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAlerts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.alerts = action.payload.alerts;
        state.meta = action.payload.meta;
        state.unreadCount = action.payload.meta.unreadCount;
      })
      .addCase(fetchAlerts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(acknowledgeAlert.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acknowledgeAlert.fulfilled, (state, action) => {
        state.isLoading = false;
        const alert = state.alerts.find((a) => a.alertId === action.payload.alertId);
        if (alert) {
          alert.status = 'ACKNOWLEDGED';
          alert.acknowledgedAt = new Date().toISOString();
          if (state.unreadCount > 0) {
            state.unreadCount--;
          }
        }
      })
      .addCase(acknowledgeAlert.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(resolveAlert.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resolveAlert.fulfilled, (state, action) => {
        state.isLoading = false;
        const alert = state.alerts.find((a) => a.alertId === action.payload.alertId);
        if (alert) {
          alert.status = 'RESOLVED';
          alert.resolvedAt = new Date().toISOString();
          alert.resolutionNotes = action.payload.resolutionNotes;
        }
      })
      .addCase(resolveAlert.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, markAlertAsRead } = alertSlice.actions;
export default alertSlice.reducer;
