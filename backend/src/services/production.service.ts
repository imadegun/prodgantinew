import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { ProductionStage } from '@prisma/client';

interface TrackProductionData {
  polDetailId: string;
  stage: ProductionStage;
  quantity: number;
  userId: string;
  notes?: string;
}

interface DiscrepancyData {
  expected: number;
  actual: number;
  difference: number;
  stage: ProductionStage;
}

export class ProductionService {
  /**
   * Get production stages for a POL detail
   */
  async getProductionStages(polDetailId: string) {
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: polDetailId },
      include: {
        productionRecords: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    // Group records by stage
    const stageRecords: Record<string, any[]> = {};
    detail.productionRecords.forEach((record) => {
      if (!stageRecords[record.stage]) {
        stageRecords[record.stage] = [];
      }
      stageRecords[record.stage].push(record);
    });

    // Calculate quantities per stage
    const stages = [
      'FORMING',
      'FIRING',
      'GLAZING',
      'QUALITY_CONTROL',
      'PACKAGING',
    ] as ProductionStage[];

    const stageData = stages.map((stage) => {
      const records = stageRecords[stage] || [];
      const latestRecord = records[0];
      const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);

      return {
        stage,
        totalQuantity,
        latestRecord,
        records,
      };
    });

    return {
      detail,
      stages: stageData,
    };
  }

  /**
   * Track production quantity at a stage
   */
  async trackProduction(data: TrackProductionData) {
    const { polDetailId, stage, quantity, userId, notes } = data;

    // Validate POL detail exists
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: polDetailId },
      include: {
        pol: true,
      },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    // Validate quantity
    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', 400, 'INVALID_QUANTITY');
    }

    // Check for discrepancies
    const discrepancy = await this.checkForDiscrepancy(polDetailId, stage, quantity);

    // Create production record
    const record = await prisma.productionRecord.create({
      data: {
        polDetailId,
        stage,
        quantity,
        userId,
        notes,
      },
    });

    // Create discrepancy alert if needed
    if (discrepancy) {
      await this.createDiscrepancyAlert({
        polId: detail.polId,
        polDetailId,
        stage,
        expected: discrepancy.expected,
        actual: discrepancy.actual,
        difference: discrepancy.difference,
        userId,
      });
    }

    // Update POL status if all stages complete
    await this.updatePOLStatus(detail.polId);

    return record;
  }

  /**
   * Get active production tasks for a user
   */
  async getActiveTasks(userId: string) {
    const tasks = await prisma.pOLDetail.findMany({
      where: {
        pol: {
          status: {
            in: ['IN_PROGRESS', 'PENDING'],
          },
        },
      },
      include: {
        pol: true,
        productionRecords: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: {
        pol: {
          deliveryDate: 'asc',
        },
      },
    });

    // Filter and format tasks
    const activeTasks = tasks
      .filter((detail) => {
        // Check if there are incomplete stages
        const stages: ProductionStage[] = ['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL', 'PACKAGING'];
        const completedStages = new Set(
          detail.productionRecords.map((r) => r.stage)
        );
        return stages.some((stage: ProductionStage) => !completedStages.has(stage));
      })
      .map((detail) => {
        const latestRecord = detail.productionRecords[0];
        const nextStage = this.getNextStage(latestRecord?.stage);

        return {
          id: detail.id,
          polNumber: detail.pol.polNumber,
          customerName: detail.pol.customerName,
          productCode: detail.productCode,
          productName: detail.productName,
          quantity: detail.quantity,
          nextStage,
          deliveryDate: detail.pol.deliveryDate,
        };
      });

    return activeTasks;
  }

  /**
   * Check for quantity discrepancies
   */
  private async checkForDiscrepancy(
    polDetailId: string,
    stage: ProductionStage,
    quantity: number
  ): Promise<DiscrepancyData | null> {
    const stageOrder = ['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL', 'PACKAGING'];
    const currentIndex = stageOrder.indexOf(stage);

    if (currentIndex === 0) {
      // First stage, no previous stage to compare
      return null;
    }

    const previousStage = stageOrder[currentIndex - 1] as ProductionStage;

    // Get total quantity from previous stage
    const previousRecords = await prisma.productionRecord.findMany({
      where: {
        polDetailId,
        stage: previousStage,
      },
    });

    const expectedQuantity = previousRecords.reduce((sum, r) => sum + r.quantity, 0);

    if (expectedQuantity === 0) {
      return null;
    }

    const difference = quantity - expectedQuantity;

    // Allow 5% tolerance
    const tolerance = expectedQuantity * 0.05;
    if (Math.abs(difference) > tolerance) {
      return {
        expected: expectedQuantity,
        actual: quantity,
        difference,
        stage,
      };
    }

    return null;
  }

  /**
   * Create discrepancy alert
   */
  private async createDiscrepancyAlert(data: {
    polId: string;
    polDetailId: string;
    stage: ProductionStage;
    expected: number;
    actual: number;
    difference: number;
    userId: string;
  }) {
    const priority = Math.abs(data.difference) > data.expected * 0.2 ? 'HIGH' : 'MEDIUM';

    await prisma.discrepancyAlert.create({
      data: {
        polId: data.polId,
        polDetailId: data.polDetailId,
        stage: data.stage,
        expectedQuantity: data.expected,
        actualQuantity: data.actual,
        difference: data.difference,
        priority,
        status: 'OPEN',
        reportedBy: data.userId,
      },
    });
  }

  /**
   * Get next production stage
   */
  private getNextStage(currentStage?: ProductionStage): ProductionStage | null {
    const stageOrder = ['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL', 'PACKAGING'];
    
    if (!currentStage) {
      return 'FORMING' as ProductionStage;
    }

    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex < stageOrder.length - 1) {
      return stageOrder[currentIndex + 1] as ProductionStage;
    }

    return null;
  }

  /**
   * Update POL status based on production progress
   */
  private async updatePOLStatus(polId: string) {
    const details = await prisma.pOLDetail.findMany({
      where: { polId },
      include: {
        productionRecords: true,
      },
    });

    let allComplete = true;
    let anyInProgress = false;

    for (const detail of details) {
      const stages = ['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL', 'PACKAGING'];
      const completedStages = new Set(
        detail.productionRecords.map((r) => r.stage)
      );

      if (completedStages.size < stages.length) {
        allComplete = false;
      }

      if (completedStages.size > 0 && completedStages.size < stages.length) {
        anyInProgress = true;
      }
    }

    let status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

    if (allComplete) {
      status = 'COMPLETED';
    } else if (anyInProgress) {
      status = 'IN_PROGRESS';
    } else {
      status = 'PENDING';
    }

    await prisma.pOL.update({
      where: { id: polId },
      data: { status },
    });
  }
}

export const productionService = new ProductionService();
