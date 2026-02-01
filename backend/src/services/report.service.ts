import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  polId?: string;
  productCode?: string;
}

export class ReportService {
  /**
   * POL order summary report
   */
  async getPOLSummary(filters: ReportFilters = {}) {
    const where: any = {};

    if (filters.startDate || filters.endDate) {
      where.orderDate = {};
      if (filters.startDate) {
        where.orderDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.orderDate.lte = filters.endDate;
      }
    }

    if (filters.polId) {
      where.id = filters.polId;
    }

    const pols = await prisma.pOL.findMany({
      where,
      include: {
        details: {
          include: {
            productionRecords: true,
          },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    const summary = pols.map((pol) => {
      const totalQuantity = pol.details.reduce((sum, d) => sum + d.quantity, 0);
      const completedQuantity = pol.details.reduce((sum, d) => {
        const qcRecords = d.productionRecords.filter((r) => r.stage === 'QUALITY_CONTROL');
        return sum + qcRecords.reduce((s, r) => s + r.quantity, 0);
      }, 0);

      return {
        polNumber: pol.polNumber,
        customerName: pol.customerName,
        orderDate: pol.orderDate,
        deliveryDate: pol.deliveryDate,
        status: pol.status,
        totalQuantity,
        completedQuantity,
        progress: totalQuantity > 0 ? (completedQuantity / totalQuantity) * 100 : 0,
        productCount: pol.details.length,
      };
    });

    return {
      summary,
      totalPOLs: pols.length,
      totalQuantity: summary.reduce((sum, s) => sum + s.totalQuantity, 0),
      totalCompleted: summary.reduce((sum, s) => sum + s.completedQuantity, 0),
    };
  }

  /**
   * Forming analysis report
   */
  async getFormingAnalysis(filters: ReportFilters = {}) {
    const where: any = {
      stage: 'FORMING',
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
    });

    // Group by user
    const byUser: Record<string, any> = {};
    records.forEach((record) => {
      const userId = record.userId;
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
    records.forEach((record) => {
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
      totalQuantity: records.reduce((sum, r) => sum + r.quantity, 0),
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
      stage: 'QUALITY_CONTROL',
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
    });

    // Group by user
    const byUser: Record<string, any> = {};
    records.forEach((record) => {
      const userId = record.userId;
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
    records.forEach((record) => {
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
      totalQuantity: records.reduce((sum, r) => sum + r.quantity, 0),
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
      where.orderDate = {};
      if (filters.startDate) {
        where.orderDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.orderDate.lte = filters.endDate;
      }
    }

    if (filters.polId) {
      where.id = filters.polId;
    }

    const pols = await prisma.pOL.findMany({
      where,
      include: {
        details: {
          include: {
            productionRecords: true,
          },
        },
      },
      orderBy: { orderDate: 'desc' },
    });

    const stages = ['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL', 'PACKAGING'];

    const progress = pols.map((pol) => {
      const detailProgress = pol.details.map((detail) => {
        const stageProgress: Record<string, any> = {};
        stages.forEach((stage) => {
          const records = detail.productionRecords.filter((r) => r.stage === stage);
          stageProgress[stage] = {
            quantity: records.reduce((sum, r) => sum + r.quantity, 0),
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
        polNumber: pol.polNumber,
        customerName: pol.customerName,
        orderDate: pol.orderDate,
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
