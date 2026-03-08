import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { ProductionStage, ProductCategory, RemakeType, ProductType } from '@prisma/client';

interface TrackProductionData {
  polDetailId: number;
  stage: ProductionStage;
  category?: ProductCategory;
  quantity: number;
  rejectQuantity?: number;
  remakeCycle?: number;
  remakeType?: RemakeType;
  ovenId?: number;
  operatorId?: number;
  rejectReasonId?: number;
  productionDate?: Date;
  userId: number;
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
  async getProductionStages(polDetailId: number) {
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

    // Calculate quantities per stage - using actual ProductionStage enum values
    const stages = [
      'THROWING',
      'TRIMMING',
      'DECORATION',
      'DRYING',
      'LOAD_BISQUE',
      'OUT_BISQUE',
      'LOAD_HIGH_FIRING',
      'OUT_HIGH_FIRING',
      'LOAD_RAKU_FIRING',
      'OUT_RAKU_FIRING',
      'LOAD_LUSTER_FIRING',
      'OUT_LUSTER_FIRING',
      'SANDING',
      'WAXING',
      'DIPPING',
      'SPRAYING',
      'COLOR_DECORATION',
      'QC_GOOD',
      'QC_REJECT',
      'QC_RE_FIRING',
      'QC_SECOND',
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
      qtyToMake: detail.qtyToMake,
      stages: stageData,
    };
  }

  /**
   * Track production quantity at a stage
   */
  async trackProduction(data: TrackProductionData) {
    const { polDetailId, stage, quantity, rejectQuantity, remakeCycle, category, remakeType, ovenId, operatorId, rejectReasonId, productionDate, userId, notes } = data;

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

    // Auto-determine category if not provided
    const productionCategory = category || this.getCategoryForStage(stage);

    // Create production record with all fields
    const record = await prisma.productionRecord.create({
      data: {
        polDetailId,
        stage,
        quantity,
        rejectQuantity: rejectQuantity || 0,
        remakeCycle: remakeCycle || 0,
        category: productionCategory,
        remakeType,
        ovenId,
        operatorId,
        rejectReasonId,
        productionDate: productionDate || undefined,
        createdBy: userId,
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
            in: ['IN_PROGRESS', 'DRAFT'],
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
        const stages: ProductionStage[] = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING', 'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION', 'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];
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
          poNumber: detail.pol.poNumber,
          clientName: detail.pol.clientName,
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
    polDetailId: number,
    stage: ProductionStage,
    quantity: number
  ): Promise<DiscrepancyData | null> {
    const stageOrder = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING', 'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION', 'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];
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
    polId: number;
    polDetailId: number;
    stage: ProductionStage;
    expected: number;
    actual: number;
    difference: number;
    userId: number;
  }) {
    const priority = Math.abs(data.difference) > data.expected * 0.2 ? 'CRITICAL' : 'WARNING';

    await prisma.discrepancyAlert.create({
      data: {
        polId: data.polId,
        polDetailId: data.polDetailId,
        stage: data.stage,
        expectedQuantity: data.expected,
        actualQuantity: data.actual,
        difference: data.difference,
        alertType: 'QUANTITY_DISCREPANCY',
        alertMessage: `Quantity discrepancy detected: expected ${data.expected}, actual ${data.actual}, difference ${data.difference}`,
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
    const stageOrder = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING', 'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION', 'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];
    
    if (!currentStage) {
      return 'THROWING' as ProductionStage;
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
  private async updatePOLStatus(polId: number) {
    const details = await prisma.pOLDetail.findMany({
      where: { polId },
      include: {
        productionRecords: true,
      },
    });

    let allComplete = true;
    let anyInProgress = false;

    for (const detail of details) {
      const stages = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING', 'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION', 'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];
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

    let status: 'DRAFT' | 'IN_PROGRESS' | 'COMPLETED';

    if (allComplete) {
      status = 'COMPLETED';
    } else if (anyInProgress) {
      status = 'IN_PROGRESS';
    } else {
      status = 'DRAFT';
    }

    await prisma.pOL.update({
      where: { id: polId },
      data: { status },
    });
  }

  /**
   * Get decoration tasks for a POL detail
   */
  async getDecorationTasks(polDetailId: number) {
    const tasks = await prisma.decorationTask.findMany({
      where: { polDetailId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      polDetailId,
      tasks: tasks.map((task) => ({
        taskId: task.id,
        taskName: task.taskName,
        taskDescription: task.taskDescription,
        quantityRequired: task.quantityRequired,
        quantityCompleted: task.quantityCompleted,
        quantityRejected: task.quantityRejected,
        status: task.status,
        notes: task.notes,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    };
  }

  /**
   * Create a new decoration task
   */
  async createDecorationTask(data: {
    polDetailId: number;
    taskName: string;
    taskDescription?: string;
    quantityRequired: number;
    notes?: string;
    createdBy?: number;
  }) {
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: data.polDetailId },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    const task = await prisma.decorationTask.create({
      data: {
        polDetailId: data.polDetailId,
        taskName: data.taskName,
        taskDescription: data.taskDescription,
        quantityRequired: data.quantityRequired,
        quantityCompleted: 0,
        quantityRejected: 0,
        status: 'PENDING',
        notes: data.notes,
        createdBy: data.createdBy,
      },
    });

    return {
      taskId: task.id,
      taskName: task.taskName,
      taskDescription: task.taskDescription,
      quantityRequired: task.quantityRequired,
      quantityCompleted: task.quantityCompleted,
      quantityRejected: task.quantityRejected,
      status: task.status,
      notes: task.notes,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  /**
   * Update a decoration task
   */
  async updateDecorationTask(
    taskId: number,
    data: {
      quantityCompleted?: number;
      quantityRejected?: number;
      notes?: string;
      status?: string;
    }
  ) {
    const task = await prisma.decorationTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError('Decoration task not found', 404, 'TASK_NOT_FOUND');
    }

    const updateData: any = {};
    if (data.quantityCompleted !== undefined) {
      updateData.quantityCompleted = data.quantityCompleted;
      // Auto-complete if quantity completed >= required
      if (data.quantityCompleted >= task.quantityRequired && task.status === 'PENDING') {
        updateData.status = 'COMPLETED';
        updateData.completedAt = new Date();
      } else if (data.quantityCompleted > 0 && task.status === 'PENDING') {
        updateData.status = 'IN_PROGRESS';
      }
    }
    if (data.quantityRejected !== undefined) {
      updateData.quantityRejected = data.quantityRejected;
    }
    if (data.notes !== undefined) {
      updateData.notes = data.notes;
    }
    if (data.status !== undefined) {
      updateData.status = data.status;
      if (data.status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }

    const updatedTask = await prisma.decorationTask.update({
      where: { id: taskId },
      data: updateData,
    });

    return {
      taskId: updatedTask.id,
      taskName: updatedTask.taskName,
      taskDescription: updatedTask.taskDescription,
      quantityRequired: updatedTask.quantityRequired,
      quantityCompleted: updatedTask.quantityCompleted,
      quantityRejected: updatedTask.quantityRejected,
      status: updatedTask.status,
      notes: updatedTask.notes,
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt,
    };
  }

  /**
   * Delete a decoration task
   */
  async deleteDecorationTask(taskId: number) {
    const task = await prisma.decorationTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError('Decoration task not found', 404, 'TASK_NOT_FOUND');
    }

    await prisma.decorationTask.delete({
      where: { id: taskId },
    });

    return { message: 'Decoration task deleted successfully' };
  }

  /**
   * Get all ovens
   */
  async getOvens() {
    const ovens = await prisma.oven.findMany({
      orderBy: { ovenCode: 'asc' },
    });
    return ovens;
  }

  /**
   * Get all defect reasons
   */
  async getDefectReasons() {
    const reasons = await prisma.defectReason.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' },
    });
    return reasons;
  }

  /**
   * Get product parts for a POL detail
   */
  async getProductParts(polDetailId: number) {
    const parts = await prisma.productPart.findMany({
      where: { polDetailId },
      orderBy: { throwingOrder: 'asc' },
    });
    return parts;
  }

  /**
   * Create a product part
   */
  async createProductPart(data: {
    polDetailId: number;
    partName: string;
    partType?: 'MAIN' | 'SUB' | 'ASSEMBLY';
    linkedToPartId?: number;
    throwingRequired?: boolean;
    throwingOrder?: number;
  }) {
    const part = await prisma.productPart.create({
      data: {
        polDetailId: data.polDetailId,
        partName: data.partName,
        partType: data.partType || 'MAIN',
        linkedToPartId: data.linkedToPartId,
        throwingRequired: data.throwingRequired !== undefined ? data.throwingRequired : true,
        throwingOrder: data.throwingOrder,
      },
    });
    return part;
  }

  /**
   * Get remake cycles for a POL detail
   */
  async getRemakeCycles(polDetailId: number) {
    const cycles = await prisma.remakeCycle.findMany({
      where: { polDetailId },
      orderBy: { remakeNumber: 'desc' },
      include: {
        rejectReason: true,
      },
    });
    return cycles;
  }

  /**
   * Create a remake cycle
   */
  async createRemakeCycle(data: {
    polDetailId: number;
    originalRecordId?: number;
    remakeNumber: number;
    remakeType: RemakeType;
    rejectStage?: string;
    rejectCategory?: string;
    rejectReasonId?: number;
    rejectQuantity: number;
    createdBy: number;
  }) {
    // Check if remake number exceeds 3 - requires escalation
    if (data.remakeNumber > 3) {
      // Create with ESCALATED status
      const cycle = await prisma.remakeCycle.create({
        data: {
          polDetailId: data.polDetailId,
          originalRecordId: data.originalRecordId,
          remakeNumber: data.remakeNumber,
          remakeType: data.remakeType,
          rejectStage: data.rejectStage,
          rejectCategory: data.rejectCategory,
          rejectReasonId: data.rejectReasonId,
          rejectQuantity: data.rejectQuantity,
          status: 'ESCALATED',
          createdBy: data.createdBy,
        },
      });
      return { cycle, isEscalated: true };
    }

    const cycle = await prisma.remakeCycle.create({
      data: {
        polDetailId: data.polDetailId,
        originalRecordId: data.originalRecordId,
        remakeNumber: data.remakeNumber,
        remakeType: data.remakeType,
        rejectStage: data.rejectStage,
        rejectCategory: data.rejectCategory,
        rejectReasonId: data.rejectReasonId,
        rejectQuantity: data.rejectQuantity,
        status: 'IN_PROGRESS',
        createdBy: data.createdBy,
      },
    });

    return { cycle, isEscalated: false };
  }

  /**
   * Get production stages based on product type
   * Handbuild and Slab products skip Forming stage
   */
  getStagesByProductType(productType: ProductType): string[] {
    const allStages = [
      'THROWING',
      'TRIMMING',
      'DECORATION',
      'DRYING',
      'LOAD_BISQUE',
      'OUT_BISQUE',
      'LOAD_HIGH_FIRING',
      'OUT_HIGH_FIRING',
      'LOAD_RAKU_FIRING',
      'OUT_RAKU_FIRING',
      'LOAD_LUSTER_FIRING',
      'OUT_LUSTER_FIRING',
      'SANDING',
      'WAXING',
      'DIPPING',
      'SPRAYING',
      'COLOR_DECORATION',
      'QC_GOOD',
      'QC_REJECT',
      'QC_RE_FIRING',
      'QC_SECOND',
    ];

    // Handbuild and Slab products skip Forming stages
    if (productType === 'HANDBUILD' || productType === 'SLAB') {
      // Start from DECORATION instead of THROWING
      return allStages.filter(stage => stage !== 'THROWING' && stage !== 'TRIMMING');
    }

    return allStages;
  }

  /**
   * Get product category for a stage
   */
  getCategoryForStage(stage: ProductionStage): ProductCategory {
    const formingStages = ['THROWING', 'TRIMMING'];
    const decorStages = ['DECORATION'];
    const dryingStages = ['DRYING'];
    const firingStages = ['LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING'];
    const glazingStages = ['SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION'];
    const qcStages = ['QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];

    if (formingStages.includes(stage)) return 'FORMING';
    if (decorStages.includes(stage)) return 'DECOR';
    if (dryingStages.includes(stage)) return 'DRYING';
    if (firingStages.includes(stage)) return 'FIRING';
    if (glazingStages.includes(stage)) return 'GLAZING';
    if (qcStages.includes(stage)) return 'QC';

    return 'FORMING'; // Default
  }

  /**
   * Get all operators (users) for selection
   */
  async getOperators() {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
      },
      orderBy: { fullName: 'asc' },
    });
    return users;
  }
}

export const productionService = new ProductionService();
