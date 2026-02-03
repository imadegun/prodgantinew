import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { POL, POLDetail } from '../types';

interface POLState {
  pols: POL[];
  currentPOL: POL | null;
  polDetails: POLDetail[];
  loading: boolean;
  error: string | null;
  filters: {
    status: string;
    dateRange: { start: string; end: string };
    search: string;
  };
}

const initialState: POLState = {
  pols: [],
  currentPOL: null,
  polDetails: [],
  loading: false,
  error: null,
  filters: {
    status: 'All',
    dateRange: { start: '', end: '' },
    search: '',
  },
};

const polSlice = createSlice({
  name: 'pol',
  initialState,
  reducers: {
    fetchPOLsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchPOLsSuccess: (state, action: PayloadAction<POL[]>) => {
      state.loading = false;
      state.pols = action.payload;
      state.error = null;
    },
    fetchPOLsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    fetchPOLDetailSuccess: (state, action: PayloadAction<POL>) => {
      state.loading = false;
      state.currentPOL = action.payload;
      state.error = null;
    },
    createPOLSuccess: (state, action: PayloadAction<POL>) => {
      state.loading = false;
      state.pols.unshift(action.payload);
      state.error = null;
    },
    updatePOLSuccess: (state, action: PayloadAction<POL>) => {
      state.loading = false;
      const index = state.pols.findIndex((pol) => pol.id === action.payload.id);
      if (index !== -1) {
        state.pols[index] = action.payload;
      }
      if (state.currentPOL?.id === action.payload.id) {
        state.currentPOL = action.payload;
      }
      state.error = null;
    },
    deletePOLSuccess: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.pols = state.pols.filter((pol) => pol.id !== action.payload);
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<POLState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearCurrentPOL: (state) => {
      state.currentPOL = null;
    },
  },
});

export const {
  fetchPOLsStart,
  fetchPOLsSuccess,
  fetchPOLsFailure,
  fetchPOLDetailSuccess,
  createPOLSuccess,
  updatePOLSuccess,
  deletePOLSuccess,
  setFilters,
  clearCurrentPOL,
} = polSlice.actions;
export default polSlice.reducer;
