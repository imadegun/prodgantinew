import { apiClient } from './api';

interface ReportStats {
  totalPOLs: number;
  completedPOLs: number;
  inProgressPOLs: number;
  delayedPOLs: number;
  onTimeDeliveryRate: number;
}

interface FormingAnalysisStats {
  totalItems: number;
  completedItems: number;
  rejectRate: number;
  remakeCount: number;
}

interface QCAnalysisStats {
  goodItems: number;
  rejectedItems: number;
  reFiringItems: number;
  secondQualityItems: number;
  passRate: number;
}

interface ProductionProgressStats {
  overallProgress: number;
  formingProgress: number;
  firingProgress: number;
  glazingProgress: number;
  qcProgress: number;
  activeAlerts: number;
}

interface ReportQuery {
  fromDate?: string;
  toDate?: string;
  polId?: string;
  status?: string;
  format?: string;
  includeAlerts?: boolean;
}

export const reportService = {
  async getPOLSummary(params?: ReportQuery): Promise<ReportStats> {
    const response = await apiClient.get<{ report: ReportStats }>('/reports/pol-summary', params);
    return response.report;
  },

  async getFormingAnalysis(params?: ReportQuery): Promise<FormingAnalysisStats> {
    const response = await apiClient.get<{ report: FormingAnalysisStats }>('/reports/forming-analysis', params);
    return response.report;
  },

  async getQCAnalysis(params?: ReportQuery): Promise<QCAnalysisStats> {
    const response = await apiClient.get<{ report: QCAnalysisStats }>('/reports/qc-analysis', params);
    return response.report;
  },

  async getProductionProgress(params?: ReportQuery): Promise<ProductionProgressStats> {
    const response = await apiClient.get<{ report: ProductionProgressStats }>('/reports/production-progress', params);
    return response.report;
  },
};
