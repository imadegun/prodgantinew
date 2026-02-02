import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Alert } from '../types';

interface AlertState {
  alerts: Alert[];
  loading: boolean;
  error: string | null;
  filters: {
    type: string;
    priority: string;
    status: string;
  };
}

const initialState: AlertState = {
  alerts: [],
  loading: false,
  error: null,
  filters: {
    type: 'All',
    priority: 'All',
    status: 'All',
  },
};

const alertSlice = createSlice({
  name: 'alerts',
  initialState,
  reducers: {
    fetchAlertsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchAlertsSuccess: (state, action: PayloadAction<Alert[]>) => {
      state.loading = false;
      state.alerts = action.payload;
      state.error = null;
    },
    fetchAlertsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    acknowledgeAlertSuccess: (state, action: PayloadAction<{ id: number; userId: number }>) => {
      const alert = state.alerts.find((a) => a.id === action.payload.id);
      if (alert) {
        alert.status = 'Acknowledged';
        alert.acknowledged_by = action.payload.userId;
        alert.acknowledged_at = new Date().toISOString();
      }
    },
    resolveAlertSuccess: (state, action: PayloadAction<{ id: number; userId: number; notes: string }>) => {
      const alert = state.alerts.find((a) => a.id === action.payload.id);
      if (alert) {
        alert.status = 'Resolved';
        alert.resolved_by = action.payload.userId;
        alert.resolved_at = new Date().toISOString();
        alert.resolution_notes = action.payload.notes;
      }
    },
    setFilters: (state, action: PayloadAction<Partial<AlertState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearAlertsError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchAlertsStart,
  fetchAlertsSuccess,
  fetchAlertsFailure,
  acknowledgeAlertSuccess,
  resolveAlertSuccess,
  setFilters,
  clearAlertsError,
} = alertSlice.actions;
export default alertSlice.reducer;
