import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiClient } from '../../services/api';

interface Report {
  reportId: string;
  reportType: 'POL_SUMMARY' | 'FORMING_ANALYSIS' | 'QC_ANALYSIS' | 'PRODUCTION_PROGRESS';
  generatedAt: string;
  generatedBy: string;
  filters: {
    fromDate?: string;
    toDate?: string;
    polId?: string;
    status?: string;
  };
  data?: any;
}

interface ReportListQuery {
  page?: number;
  limit?: number;
  reportType?: string;
}

interface ReportListResponse {
  reports: Report[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface GenerateReportRequest {
  reportType: string;
  filters: {
    fromDate?: string;
    toDate?: string;
    polId?: string;
    status?: string;
  };
  format?: 'JSON' | 'PDF' | 'EXCEL' | 'CSV';
}

interface ReportState {
  reports: Report[];
  isLoading: boolean;
  error: string | null;
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ReportState = {
  reports: [],
  isLoading: false,
  error: null,
  meta: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const fetchReports = createAsyncThunk(
  'reports/fetchReports',
  async (params: ReportListQuery, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<ReportListResponse>('/reports', params);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to fetch reports'
      );
    }
  }
);

export const generatePOLSummaryReport = createAsyncThunk(
  'reports/generatePOLSummary',
  async (request: GenerateReportRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>('/reports/pol-summary', request);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to generate POL summary report'
      );
    }
  }
);

export const generateFormingAnalysisReport = createAsyncThunk(
  'reports/generateFormingAnalysis',
  async (request: GenerateReportRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>('/reports/forming-analysis', request);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to generate forming analysis report'
      );
    }
  }
);

export const generateQCAnalysisReport = createAsyncThunk(
  'reports/generateQCAnalysis',
  async (request: GenerateReportRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>('/reports/qc-analysis', request);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to generate QC analysis report'
      );
    }
  }
);

export const generateProductionProgressReport = createAsyncThunk(
  'reports/generateProductionProgress',
  async (request: GenerateReportRequest, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any>('/reports/production-progress', request);
      return response;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || 'Failed to generate production progress report'
      );
    }
  }
);

const reportSlice = createSlice({
  name: 'reports',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reports = action.payload.reports;
        state.meta = action.payload.meta;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(generatePOLSummaryReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generatePOLSummaryReport.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add new report to list if it was generated
        if (action.payload) {
          state.reports.unshift(action.payload);
        }
      })
      .addCase(generatePOLSummaryReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(generateFormingAnalysisReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateFormingAnalysisReport.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.reports.unshift(action.payload);
        }
      })
      .addCase(generateFormingAnalysisReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(generateQCAnalysisReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateQCAnalysisReport.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.reports.unshift(action.payload);
        }
      })
      .addCase(generateQCAnalysisReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(generateProductionProgressReport.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(generateProductionProgressReport.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.reports.unshift(action.payload);
        }
      })
      .addCase(generateProductionProgressReport.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = reportSlice.actions;
export default reportSlice.reducer;
