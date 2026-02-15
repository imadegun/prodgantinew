import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  polId?: string;
  productCode?: string;
  fromDate?: string;
  toDate?: string;
  format?: string;
  includeAlerts?: boolean;
  status?: string;
}

export class ReportService {
  /**
   * POL order summary report
   */
  async getPOLSummary(filters: ReportFilters = {}) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.poDate = {};
      if (filters.startDate) {
        where.poDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.poDate.lte = filters.endDate;
      }
    }

    if (filters.polId) {
      where.id = filters.polId;
    }

    const pols = await prisma.pOL.findMany({
      where,
      include: {
        polDetails: {
          include: {
            productionRecords: true,
          },
        },
      },
      orderBy: { poDate: 'desc' },
    }) as any;

    const summary = pols.map((pol: any) => {
      const totalQuantity = pol.polDetails.reduce((sum: number, d: any) => sum + d.quantity, 0);
      const completedQuantity = pol.polDetails.reduce((sum: number, d: any) => {
        const qcRecords = d.productionRecords.filter((r: any) => r.stage === 'QC_GOOD');
        return sum + qcRecords.reduce((s: number, r: any) => s + r.quantity, 0);
      }, 0);

      return {
        poNumber: pol.poNumber,
        clientName: pol.clientName,
        poDate: pol.poDate,
        deliveryDate: pol.deliveryDate,
        status: pol.status,
        totalQuantity,
        completedQuantity,
        progress: totalQuantity > 0 ? (completedQuantity / totalQuantity) * 100 : 0,
        productCount: pol.polDetails.length,
      };
    });

    return {
      summary,
      totalPOLs: pols.length,
      totalQuantity: summary.reduce((sum: number, s: any) => sum + s.totalQuantity, 0),
      totalCompleted: summary.reduce((sum: number, s: any) => sum + s.completedQuantity, 0),
    };
  }

  /**
   * Forming analysis report
   */
  async getFormingAnalysis(filters: ReportFilters = {}) {
    const where: any = {
      stage: 'THROWING',
    };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const records = await prisma.productionRecord.findMany({
      where,
      include: {
        polDetail: {
          include: {
            pol: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as any;

    // Group by user
    const byUser: Record<string, any> = {};
    records.forEach((record: any) => {
      const userId = record.createdBy;
      if (!byUser[userId]) {
        byUser[userId] = {
          user: record.user,
          totalQuantity: 0,
          recordCount: 0,
        };
      }
      byUser[userId].totalQuantity += record.quantity;
      byUser[userId].recordCount += 1;
    });

    // Group by product
    const byProduct: Record<string, any> = {};
    records.forEach((record: any) => {
      const productCode = record.polDetail.productCode;
      if (!byProduct[productCode]) {
        byProduct[productCode] = {
          productCode,
          productName: record.polDetail.productName,
          totalQuantity: 0,
          recordCount: 0,
        };
      }
      byProduct[productCode].totalQuantity += record.quantity;
      byProduct[productCode].recordCount += 1;
    });

    return {
      totalRecords: records.length,
      totalQuantity: records.reduce((sum: number, r: any) => sum + r.quantity, 0),
      byUser: Object.values(byUser),
      byProduct: Object.values(byProduct),
      records,
    };
  }

  /**
   * QC analysis report
   */
  async getQCAnalysis(filters: ReportFilters = {}) {
    const where: any = {
      stage: 'QC_GOOD',
    };

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const records = await prisma.productionRecord.findMany({
      where,
      include: {
        polDetail: {
          include: {
            pol: true,
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    }) as any;

    // Group by user
    const byUser: Record<string, any> = {};
    records.forEach((record: any) => {
      const userId = record.createdBy;
      if (!byUser[userId]) {
        byUser[userId] = {
          user: record.user,
          totalQuantity: 0,
          recordCount: 0,
        };
      }
      byUser[userId].totalQuantity += record.quantity;
      byUser[userId].recordCount += 1;
    });

    // Group by product
    const byProduct: Record<string, any> = {};
    records.forEach((record: any) => {
      const productCode = record.polDetail.productCode;
      if (!byProduct[productCode]) {
        byProduct[productCode] = {
          productCode,
          productName: record.polDetail.productName,
          totalQuantity: 0,
          recordCount: 0,
        };
      }
      byProduct[productCode].totalQuantity += record.quantity;
      byProduct[productCode].recordCount += 1;
    });

    return {
      totalRecords: records.length,
      totalQuantity: records.reduce((sum: number, r: any) => sum + r.quantity, 0),
      byUser: Object.values(byUser),
      byProduct: Object.values(byProduct),
      records,
    };
  }

  /**
   * Production progress report
   */
  async getProductionProgress(filters: ReportFilters = {}) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.poDate = {};
      if (filters.startDate) {
        where.poDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.poDate.lte = filters.endDate;
      }
    }

    if (filters.polId) {
      where.id = filters.polId;
    }

    const pols = await prisma.pOL.findMany({
      where,
      include: {
        polDetails: {
          include: {
            productionRecords: true,
          },
        },
      },
      orderBy: { poDate: 'desc' },
    }) as any;

    const stages = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING', 'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION', 'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];

    const progress = pols.map((pol: any) => {
      const detailProgress = pol.polDetails.map((detail: any) => {
        const stageProgress: Record<string, any> = {};
        stages.forEach((stage) => {
          const records = detail.productionRecords.filter((r: any) => r.stage === stage);
          stageProgress[stage] = {
            quantity: records.reduce((sum: number, r: any) => sum + r.quantity, 0),
            records: records.length,
          };
        });

        return {
          productCode: detail.productCode,
          productName: detail.productName,
          quantity: detail.quantity,
          stageProgress,
        };
      });

      return {
        poNumber: pol.poNumber,
        clientName: pol.clientName,
        poDate: pol.poDate,
        deliveryDate: pol.deliveryDate,
        status: pol.status,
        details: detailProgress,
      };
    });

    return {
      progress,
      totalPOLs: pols.length,
    };
  }

  /**
   * Discrepancy report
   */
  async getDiscrepancyReport(filters: ReportFilters = {}) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    if (filters.polId) {
      where.polId = filters.polId;
    }

    const alerts = await prisma.discrepancyAlert.findMany({
      where,
      include: {
        pol: true,
        polDetail: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by stage
    const byStage: Record<string, any> = {};
    alerts.forEach((alert) => {
      const stage = alert.stage;
      if (!byStage[stage]) {
        byStage[stage] = {
          stage,
          count: 0,
          totalDifference: 0,
        };
      }
      byStage[stage].count += 1;
      byStage[stage].totalDifference += Math.abs(alert.difference);
    });

    // Group by priority
    const byPriority: Record<string, any> = {};
    alerts.forEach((alert) => {
      const priority = alert.priority;
      if (!byPriority[priority]) {
        byPriority[priority] = {
          priority,
          count: 0,
        };
      }
      byPriority[priority].count += 1;
    });

    return {
      totalAlerts: alerts.length,
      byStage: Object.values(byStage),
      byPriority: Object.values(byPriority),
      alerts,
    };
  }
}

export const reportService = new ReportService();
