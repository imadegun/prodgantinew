import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { ProductionStage } from '@prisma/client';
import { productService } from './product.service';

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

    // Get production workflow from MySQL based on product code
    let workflowStages: string[] = [];
    let workflow: any = null;
    
    try {
      workflow = await productService.getProductionWorkflow(detail.productCode);
      if (workflow) {
        workflowStages = workflow.stages;
      }
    } catch (error) {
      console.error('Error getting production workflow:', error);
      // Fall back to default stages if workflow lookup fails
    }

    // If workflow lookup failed, use default stages based on productType
    if (workflowStages.length === 0) {
      workflowStages = this.getStagesByProductType(detail.productType);
    }

    // Group records by stage
    const stageRecords: Record<string, any[]> = {};
    detail.productionRecords.forEach((record) => {
      if (!stageRecords[record.stage]) {
        stageRecords[record.stage] = [];
      }
      stageRecords[record.stage].push(record);
    });

    // Calculate quantities per stage - using dynamic stages from workflow
    const stageData = workflowStages.map((stage) => {
      const records = stageRecords[stage] || [];
      const latestRecord = records[0];
      const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
      const totalRejectQuantity = records.reduce((sum, r) => sum + (r.rejectQuantity || 0), 0);

      return {
        stage,
        totalQuantity,
        totalRejectQuantity,
        latestRecord,
        records,
      };
    });

    return {
      detail,
      qtyToMake: detail.qtyToMake,
      workflow,
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
    const discrepancy = await this.checkForDiscrepancy(polDetailId, stage, quantity, rejectQuantity);

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
    quantity: number,
    rejectQuantity?: number
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

    // Get already recorded quantity for current stage (including rejects)
    const currentRecords = await prisma.productionRecord.findMany({
      where: {
        polDetailId,
        stage,
      },
    });

    const alreadyRecordedGood = currentRecords.reduce((sum, r) => sum + r.quantity, 0);
    const alreadyRecordedRejects = currentRecords.reduce((sum, r) => sum + (r.rejectQuantity || 0), 0);
    const newRejectQuantity = rejectQuantity || 0;

    // Calculate total after adding new entry (good + rejects)
    const totalAfterNewEntry = alreadyRecordedGood + quantity + alreadyRecordedRejects + newRejectQuantity;

    const difference = totalAfterNewEntry - expectedQuantity;

    // Allow 5% tolerance
    const tolerance = expectedQuantity * 0.05;
    if (Math.abs(difference) > tolerance) {
      return {
        expected: expectedQuantity,
        actual: totalAfterNewEntry,
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
   * Get all defect reasons (active only)
   */
  async getDefectReasons() {
    const reasons = await prisma.defectReason.findMany({
      where: { isActive: true },
      orderBy: { category: 'asc' },
    });
    return reasons;
  }

  /**
   * Get all defect reasons including inactive (for management)
   */
  async getAllDefectReasons() {
    const reasons = await prisma.defectReason.findMany({
      orderBy: { category: 'asc' },
    });
    return reasons;
  }

  /**
   * Create a new defect reason
   */
  async createDefectReason(data: {
    category: string;
    description: string;
  }) {
    // Check for duplicate category + description combination
    const existing = await prisma.defectReason.findFirst({
      where: {
        category: data.category,
        description: data.description,
      },
    });

    if (existing) {
      throw new AppError('Defect reason with same category and description already exists', 400, 'DUPLICATE_REASON');
    }

    const reason = await prisma.defectReason.create({
      data: {
        category: data.category,
        description: data.description,
        isActive: true,
      },
    });

    return reason;
  }

  /**
   * Update a defect reason
   */
  async updateDefectReason(
    reasonId: number,
    data: {
      category?: string;
      description?: string;
      isActive?: boolean;
    }
  ) {
    const reason = await prisma.defectReason.findUnique({
      where: { id: reasonId },
    });

    if (!reason) {
      throw new AppError('Defect reason not found', 404, 'REASON_NOT_FOUND');
    }

    // Check for duplicate if updating category and description
    if (data.category && data.description) {
      const existing = await prisma.defectReason.findFirst({
        where: {
          category: data.category,
          description: data.description,
          NOT: { id: reasonId },
        },
      });

      if (existing) {
        throw new AppError('Defect reason with same category and description already exists', 400, 'DUPLICATE_REASON');
      }
    }

    const updated = await prisma.defectReason.update({
      where: { id: reasonId },
      data: {
        ...(data.category && { category: data.category }),
        ...(data.description && { description: data.description }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
      },
    });

    return updated;
  }

  /**
   * Delete (deactivate) a defect reason
   */
  async deleteDefectReason(reasonId: number) {
    const reason = await prisma.defectReason.findUnique({
      where: { id: reasonId },
    });

    if (!reason) {
      throw new AppError('Defect reason not found', 404, 'REASON_NOT_FOUND');
    }

    // Soft delete - just set isActive to false
    await prisma.defectReason.update({
      where: { id: reasonId },
      data: { isActive: false },
    });

    return { message: 'Defect reason deactivated successfully' };
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
   * Update a product part
   */
  async updateProductPart(
    partId: number,
    data: {
      partName?: string;
      partType?: 'MAIN' | 'SUB' | 'ASSEMBLY';
      linkedToPartId?: number;
      throwingRequired?: boolean;
      throwingOrder?: number;
    }
  ) {
    const part = await prisma.productPart.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new AppError('Product part not found', 404, 'PART_NOT_FOUND');
    }

    const updated = await prisma.productPart.update({
      where: { id: partId },
      data: {
        ...(data.partName && { partName: data.partName }),
        ...(data.partType && { partType: data.partType }),
        ...(data.linkedToPartId !== undefined && { linkedToPartId: data.linkedToPartId }),
        ...(data.throwingRequired !== undefined && { throwingRequired: data.throwingRequired }),
        ...(data.throwingOrder !== undefined && { throwingOrder: data.throwingOrder }),
      },
    });

    return updated;
  }

  /**
   * Delete a product part
   */
  async deleteProductPart(partId: number) {
    const part = await prisma.productPart.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new AppError('Product part not found', 404, 'PART_NOT_FOUND');
    }

    await prisma.productPart.delete({
      where: { id: partId },
    });

    return { message: 'Product part deleted successfully' };
  }

  /**
   * Get production stages for a specific product part
   */
  async getPartProductionStages(partId: number) {
    const part = await prisma.productPart.findUnique({
      where: { id: partId },
      include: {
        polDetail: {
          include: {
            pol: true,
          },
        },
        productionRecords: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!part) {
      throw new AppError('Product part not found', 404, 'PART_NOT_FOUND');
    }

    // Get workflow stages
    let workflowStages: string[] = [];
    try {
      const workflow = await productService.getProductionWorkflow(part.polDetail.productCode);
      if (workflow) {
        workflowStages = workflow.stages;
      }
    } catch (error) {
      console.error('Error getting production workflow:', error);
    }

    if (workflowStages.length === 0) {
      workflowStages = this.getStagesByProductType(part.polDetail.productType);
    }

    // Group records by stage
    const stageRecords: Record<string, any[]> = {};
    part.productionRecords.forEach((record) => {
      if (!stageRecords[record.stage]) {
        stageRecords[record.stage] = [];
      }
      stageRecords[record.stage].push(record);
    });

    // Calculate quantities per stage
    const stageData = workflowStages.map((stage) => {
      const records = stageRecords[stage] || [];
      const latestRecord = records[0];
      const totalQuantity = records.reduce((sum, r) => sum + r.quantity, 0);
      const totalRejectQuantity = records.reduce((sum, r) => sum + (r.rejectQuantity || 0), 0);

      return {
        stage,
        totalQuantity,
        totalRejectQuantity,
        latestRecord,
        records,
      };
    });

    return {
      part,
      polDetail: part.polDetail,
      stages: stageData,
    };
  }

  /**
   * Track production for a specific part
   */
  async trackPartProduction(data: TrackProductionData & { partId: number }) {
    const { partId, polDetailId, stage, quantity, rejectQuantity, remakeCycle, category, remakeType, ovenId, operatorId, rejectReasonId, productionDate, userId, notes } = data;

    // Validate part exists
    const part = await prisma.productPart.findUnique({
      where: { id: partId },
    });

    if (!part) {
      throw new AppError('Product part not found', 404, 'PART_NOT_FOUND');
    }

    // Validate quantity
    if (quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', 400, 'INVALID_QUANTITY');
    }

    // Check for discrepancies
    const discrepancy = await this.checkForPartDiscrepancy(partId, stage, quantity, rejectQuantity);

    // Auto-determine category if not provided
    const productionCategory = category || this.getCategoryForStage(stage);

    // Create production record with part reference
    const record = await prisma.productionRecord.create({
      data: {
        polDetailId,
        partId,
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
      const detail = await prisma.pOLDetail.findUnique({
        where: { id: polDetailId },
      });

      if (detail) {
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
    }

    return record;
  }

  /**
   * Check for quantity discrepancies at part level
   */
  private async checkForPartDiscrepancy(
    partId: number,
    stage: ProductionStage,
    quantity: number,
    rejectQuantity?: number
  ): Promise<DiscrepancyData | null> {
    const stageOrder = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'LOAD_RAKU_FIRING', 'OUT_RAKU_FIRING', 'LOAD_LUSTER_FIRING', 'OUT_LUSTER_FIRING', 'SANDING', 'WAXING', 'DIPPING', 'SPRAYING', 'COLOR_DECORATION', 'QC_GOOD', 'QC_REJECT', 'QC_RE_FIRING', 'QC_SECOND'];
    const currentIndex = stageOrder.indexOf(stage);

    if (currentIndex === 0) {
      return null;
    }

    const previousStage = stageOrder[currentIndex - 1] as ProductionStage;

    // Get total quantity from previous stage for this part
    const previousRecords = await prisma.productionRecord.findMany({
      where: {
        partId,
        stage: previousStage,
      },
    });

    const expectedQuantity = previousRecords.reduce((sum, r) => sum + r.quantity, 0);

    if (expectedQuantity === 0) {
      return null;
    }

    // Get already recorded quantity for current stage
    const currentRecords = await prisma.productionRecord.findMany({
      where: {
        partId,
        stage,
      },
    });

    const alreadyRecordedGood = currentRecords.reduce((sum, r) => sum + r.quantity, 0);
    const alreadyRecordedRejects = currentRecords.reduce((sum, r) => sum + (r.rejectQuantity || 0), 0);
    const newRejectQuantity = rejectQuantity || 0;

    const totalAfterNewEntry = alreadyRecordedGood + quantity + alreadyRecordedRejects + newRejectQuantity;
    const difference = totalAfterNewEntry - expectedQuantity;

    const tolerance = expectedQuantity * 0.05;
    if (Math.abs(difference) > tolerance) {
      return {
        expected: expectedQuantity,
        actual: totalAfterNewEntry,
        difference,
        stage,
      };
    }

    return null;
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
   * Only returns active users with WORKER role for production tracking
   */
  async getOperators() {
    const users = await prisma.user.findMany({
      where: { 
        role: 'WORKER',
        is_active: true,
      },
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

  /**
   * Combine multiple product parts at any production stage
   */
  async combineParts(data: {
    polDetailId: number;
    stage: ProductionStage;
    parts: Array<{ partId: number; quantity: number }>;
    notes?: string;
    userId: number;
  }) {
    const { polDetailId, stage, parts, notes, userId } = data;

    // Validate POL detail exists
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: polDetailId },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    // Validate at least 2 parts are provided
    if (parts.length < 2) {
      throw new AppError('At least 2 parts are required for combination', 400, 'INSUFFICIENT_PARTS');
    }

    // Validate all parts exist and belong to this POL detail
    const partIds = parts.map(p => p.partId);
    const existingParts = await prisma.productPart.findMany({
      where: {
        id: { in: partIds },
        polDetailId,
      },
    });

    if (existingParts.length !== partIds.length) {
      throw new AppError('One or more parts not found', 404, 'PARTS_NOT_FOUND');
    }

    // Calculate combined quantity (minimum of all parts)
    const quantities = parts.map(p => p.quantity);
    const combinedQuantity = Math.min(...quantities);

    if (combinedQuantity <= 0) {
      throw new AppError('Combined quantity must be greater than 0', 400, 'INVALID_QUANTITY');
    }

    // Create combination record
    const combination = await prisma.productPartCombination.create({
      data: {
        polDetailId,
        combinedAtStage: stage,
        combinedQuantity,
        combinedBy: userId,
        notes,
      },
    });

    // Create combination items
    const combinationItems = await Promise.all(
      parts.map(part =>
        prisma.productPartCombinationItem.create({
          data: {
            combinationId: combination.id,
            partId: part.partId,
            quantityUsed: part.quantity,
          },
        })
      )
    );

    // Create a production record for the combined unit
    const productionRecord = await prisma.productionRecord.create({
      data: {
        polDetailId,
        stage,
        quantity: combinedQuantity,
        rejectQuantity: 0,
        remakeCycle: 0,
        category: this.getCategoryForStage(stage),
        createdBy: userId,
        notes: `Combined from ${parts.length} parts: ${notes || ''}`,
      },
    });

    return {
      combination,
      combinationItems,
      productionRecord,
      combinedQuantity,
    };
  }

  /**
   * Get all part combinations for a POL detail
   */
  async getPartCombinations(polDetailId: number) {
    const combinations = await prisma.productPartCombination.findMany({
      where: { polDetailId },
      include: {
        combinationItems: {
          include: {
            part: true,
          },
        },
        combinedByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return combinations;
  }
}

export const productionService = new ProductionService();
