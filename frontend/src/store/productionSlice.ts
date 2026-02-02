import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ProductionRecord, DecorationTask } from '../types';

interface ProductionState {
  currentStage: string;
  records: ProductionRecord[];
  decorationTasks: DecorationTask[];
  loading: boolean;
  error: string | null;
  selectedPOL: number | null;
  selectedProduct: number | null;
}

const initialState: ProductionState = {
  currentStage: '',
  records: [],
  decorationTasks: [],
  loading: false,
  error: null,
  selectedPOL: null,
  selectedProduct: null,
};

const productionSlice = createSlice({
  name: 'production',
  initialState,
  reducers: {
    fetchProductionRecordsStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProductionRecordsSuccess: (state, action: PayloadAction<ProductionRecord[]>) => {
      state.loading = false;
      state.records = action.payload;
      state.error = null;
    },
    fetchProductionRecordsFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    addProductionRecordSuccess: (state, action: PayloadAction<ProductionRecord>) => {
      state.loading = false;
      state.records.push(action.payload);
      state.error = null;
    },
    updateProductionRecordSuccess: (state, action: PayloadAction<ProductionRecord>) => {
      state.loading = false;
      const index = state.records.findIndex((r) => r.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
      state.error = null;
    },
    fetchDecorationTasksSuccess: (state, action: PayloadAction<DecorationTask[]>) => {
      state.loading = false;
      state.decorationTasks = action.payload;
      state.error = null;
    },
    updateDecorationTaskSuccess: (state, action: PayloadAction<DecorationTask>) => {
      state.loading = false;
      const index = state.decorationTasks.findIndex((t) => t.id === action.payload.id);
      if (index !== -1) {
        state.decorationTasks[index] = action.payload;
      }
      state.error = null;
    },
    setSelectedPOL: (state, action: PayloadAction<number | null>) => {
      state.selectedPOL = action.payload;
      state.selectedProduct = null;
    },
    setSelectedProduct: (state, action: PayloadAction<number | null>) => {
      state.selectedProduct = action.payload;
    },
    setCurrentStage: (state, action: PayloadAction<string>) => {
      state.currentStage = action.payload;
    },
    clearProductionError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchProductionRecordsStart,
  fetchProductionRecordsSuccess,
  fetchProductionRecordsFailure,
  addProductionRecordSuccess,
  updateProductionRecordSuccess,
  fetchDecorationTasksSuccess,
  updateDecorationTaskSuccess,
  setSelectedPOL,
  setSelectedProduct,
  setCurrentStage,
  clearProductionError,
} = productionSlice.actions;
export default productionSlice.reducer;
