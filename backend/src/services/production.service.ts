import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { ProductionStage, StageSubProcess } from '@prisma/client';
import { productService } from './product.service';

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
        production_records: {
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
        console.log(`[getProductionStages] Product: ${detail.productCode}, Workflow: ${workflow.workflowType}, Stages:`, workflowStages);
      }
    } catch (error) {
      console.error('Error getting production workflow:', error);
      // Fall back to default stages if workflow lookup fails
    }

    // If workflow lookup failed, use default stages based on productType
    if (workflowStages.length === 0) {
      workflowStages = this.getStagesByProductType(detail.productType);
      console.log(`[getProductionStages] Using fallback stages for product type: ${detail.productType}, Stages:`, workflowStages);
    }

    // Group records by stage
    const stageRecords: Record<string, any[]> = {};
    detail.production_records.forEach((record) => {
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
      workflow,
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

    // Validate that all sub-processes are complete before allowing stage completion
    await this.validateStageCompletion(polDetailId, stage);

    // Check for discrepancies
    const discrepancy = await this.checkForDiscrepancy(polDetailId, stage, quantity);

    // Create production record
    const record = await prisma.productionRecord.create({
      data: {
        id: `prod-${Date.now()}`,
        polDetailId,
        stage,
        quantity,
        userId,
        notes,
        createdAt: new Date(),
        updatedAt: new Date(),
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
            in: ['IN_PROGRESS'],
          },
        },
      },
      include: {
        pol: true,
        production_records: {
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
        const stages: ProductionStage[] = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'SANDING', 'DIPPING', 'QC_GOOD'];
        const completedStages = new Set(
          detail.production_records.map((r: any) => r.stage)
        );
        return stages.some((stage: ProductionStage) => !completedStages.has(stage));
      })
      .map((detail) => {
        const latestRecord = detail.production_records[0];
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
    polDetailId: string,
    stage: ProductionStage,
    quantity: number
  ): Promise<DiscrepancyData | null> {
    const stageOrder = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'SANDING', 'DIPPING', 'QC_GOOD'];
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

    // Get already recorded quantity for current stage
    const currentRecords = await prisma.productionRecord.findMany({
      where: {
        polDetailId,
        stage,
      },
    });

    const alreadyRecorded = currentRecords.reduce((sum, r) => sum + r.quantity, 0);

    // Calculate total after adding new entry
    const totalAfterNewEntry = alreadyRecorded + quantity;

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
        id: `disc-${Date.now()}`,
        polId: data.polId,
        polDetailId: data.polDetailId,
        stage: data.stage,
        expectedQuantity: data.expected,
        actualQuantity: data.actual,
        difference: data.difference,
        priority,
        status: 'OPEN',
        reportedBy: data.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  /**
   * Get next production stage
   */
  private getNextStage(currentStage?: ProductionStage): ProductionStage | null {
    const stageOrder = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'SANDING', 'DIPPING', 'QC_GOOD'];
    
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
  private async updatePOLStatus(polId: string) {
    const details = await prisma.pOLDetail.findMany({
      where: { polId },
      include: {
        production_records: true,
      },
    });

    let allComplete = true;
    let anyInProgress = false;

    for (const detail of details) {
      const stages = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'SANDING', 'DIPPING', 'QC_GOOD'];
      const completedStages = new Set(
        detail.production_records.map((r) => r.stage)
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

  /**
   * Get decoration tasks for a POL detail
   */
  async getDecorationTasks(polDetailId: string) {
    const tasks = await prisma.decorationTask.findMany({
      where: { polDetailId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      polDetailId,
      tasks: tasks.map((task) => ({
        taskId: task.id,
        taskName: task.taskName,
        description: task.description,
        quantity: task.quantity,
        completed: task.completed,
        completedAt: task.completedAt,
        createdAt: task.createdAt,
        updatedAt: task.updatedAt,
      })),
    };
  }

  /**
   * Create a new decoration task
   */
  async createDecorationTask(data: {
    polDetailId: string;
    taskName: string;
    description?: string;
    quantity: number;
    userId?: string;
  }) {
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: data.polDetailId },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    const task = await prisma.decorationTask.create({
      data: {
        id: `dec-${Date.now()}`,
        polDetailId: data.polDetailId,
        taskName: data.taskName,
        description: data.description,
        quantity: data.quantity,
        completed: false,
        userId: data.userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return {
      taskId: task.id,
      taskName: task.taskName,
      description: task.description,
      quantity: task.quantity,
      completed: task.completed,
      completedAt: task.completedAt,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    };
  }

  /**
   * Update a decoration task
   */
  async updateDecorationTask(
    taskId: string,
    data: {
      quantity?: number;
      completed?: boolean;
      completedAt?: Date;
    }
  ) {
    const task = await prisma.decorationTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      throw new AppError('Decoration task not found', 404, 'TASK_NOT_FOUND');
    }

    const updateData: any = {};
    if (data.quantity !== undefined) {
      updateData.quantity = data.quantity;
    }
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      if (data.completed) {
        updateData.completedAt = new Date();
      }
    }
    if (data.completedAt !== undefined) {
      updateData.completedAt = data.completedAt;
    }

    const updatedTask = await prisma.decorationTask.update({
      where: { id: taskId },
      data: updateData,
    });

    return {
      taskId: updatedTask.id,
      taskName: updatedTask.taskName,
      description: updatedTask.description,
      quantity: updatedTask.quantity,
      completed: updatedTask.completed,
      completedAt: updatedTask.completedAt,
      createdAt: updatedTask.createdAt,
      updatedAt: updatedTask.updatedAt,
    };
  }

  /**
   * Delete a decoration task
   */
  async deleteDecorationTask(taskId: string) {
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
        id: `defect-${Date.now()}`,
        category: data.category,
        description: data.description,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    return reason;
  }

  /**
   * Update a defect reason
   */
  async updateDefectReason(
    reasonId: string,
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
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Delete (deactivate) a defect reason
   */
  async deleteDefectReason(reasonId: string) {
    const reason = await prisma.defectReason.findUnique({
      where: { id: reasonId },
    });

    if (!reason) {
      throw new AppError('Defect reason not found', 404, 'REASON_NOT_FOUND');
    }

    // Soft delete - just set isActive to false
    await prisma.defectReason.update({
      where: { id: reasonId },
      data: { isActive: false, updatedAt: new Date() },
    });

    return { message: 'Defect reason deactivated successfully' };
  }

  /**
   * Get product parts for a POL detail
   */
  async getProductParts(polDetailId: string) {
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
    polDetailId: string;
    partName: string;
    partType?: string;
    throwingRequired?: boolean;
    throwingOrder?: number;
  }) {
    const part = await prisma.productPart.create({
      data: {
        id: `part-${Date.now()}`,
        polDetailId: data.polDetailId,
        partName: data.partName,
        partType: data.partType || 'MAIN',
        throwingRequired: data.throwingRequired !== undefined ? data.throwingRequired : true,
        throwingOrder: data.throwingOrder,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    return part;
  }

  /**
   * Update a product part
   */
  async updateProductPart(
    partId: string,
    data: {
      partName?: string;
      partType?: string;
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
        ...(data.throwingRequired !== undefined && { throwingRequired: data.throwingRequired }),
        ...(data.throwingOrder !== undefined && { throwingOrder: data.throwingOrder }),
        updatedAt: new Date(),
      },
    });

    return updated;
  }

  /**
   * Delete a product part
   */
  async deleteProductPart(partId: string) {
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
   * Returns the same workflow stages as the parent product
   */
  async getPartProductionStages(partId: string) {
    const part = await prisma.productPart.findUnique({
      where: { id: partId },
      include: {
        pol_details: true,
      },
    });

    if (!part) {
      throw new AppError('Product part not found', 404, 'PART_NOT_FOUND');
    }

    // Get production workflow from MySQL based on product code
    let workflowStages: string[] = [];
    let workflow: any = null;
    
    try {
      workflow = await productService.getProductionWorkflow(part.pol_details.productCode);
      if (workflow) {
        workflowStages = workflow.stages;
        console.log(`[getPartProductionStages] Part: ${partId}, Product: ${part.pol_details.productCode}, Workflow: ${workflow.workflowType}, Stages:`, workflowStages);
      }
    } catch (error) {
      console.error('Error getting production workflow for part:', error);
    }

    // If workflow lookup failed, use default stages based on productType
    if (workflowStages.length === 0) {
      workflowStages = this.getStagesByProductType(part.pol_details.productType);
    }

    // Note: Part production records are stored in production_records table with partId reference
    // For now, we return the workflow stages and empty records
    const stageData = workflowStages.map((stage) => ({
      stage,
      totalQuantity: 0,
      totalRejectQuantity: 0,
      latestRecord: null,
      records: [],
    }));

    return {
      part,
      workflow,
      stages: stageData,
    };
  }

  /**
   * Get production stages based on product type
   * Handbuild and Slab products skip Forming stage
   */
  getStagesByProductType(productType: string): string[] {
    const allStages = [
      'THROWING',
      'TRIMMING',
      'DECORATION',
      'DRYING',
      'LOAD_BISQUE',
      'OUT_BISQUE',
      'LOAD_HIGH_FIRING',
      'OUT_HIGH_FIRING',
      'SANDING',
      'DIPPING',
      'QC_GOOD',
    ];

    // Handbuild and Slab products skip Forming stages
    if (productType === 'HAND_BUILT' || productType === 'SLAB_TRAY') {
      // Start from DECORATION instead of THROWING
      return allStages.filter(stage => stage !== 'THROWING' && stage !== 'TRIMMING');
    }

    return allStages;
  }

  /**
   * Get all operators (users) for selection
   * Returns active users with WORKER role for production tracking
   */
  async getOperators() {
    try {
      // Try with Prisma enum first
      const users = await prisma.user.findMany({
        where: {
          role: 'WORKER' as any,
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
      
      // If no WORKER users found, return all active users as fallback
      if (users.length === 0) {
        const allUsers = await prisma.user.findMany({
          where: { is_active: true },
          select: {
            id: true,
            username: true,
            fullName: true,
            role: true,
          },
          orderBy: { fullName: 'asc' },
        });
        console.log(`[getOperators] No WORKER users found, returning all ${allUsers.length} active users`);
        return allUsers;
      }
      
      console.log(`[getOperators] Found ${users.length} WORKER users`);
      return users;
    } catch (error) {
      console.error('[getOperators] Error fetching operators:', error);
      // Fallback: return all active users
      const allUsers = await prisma.user.findMany({
        where: { is_active: true },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
        },
        orderBy: { fullName: 'asc' },
      });
      return allUsers;
    }
  }

  /**
   * Get all sub-processes for a specific stage of a POL detail
   */
  async getStageSubProcesses(polDetailId: string, stage: string) {
    // Validate POL detail exists
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: polDetailId },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    const subProcesses = await prisma.stageSubProcess.findMany({
      where: {
        polDetailId,
        stage,
      },
      orderBy: { processOrder: 'asc' },
    });

    return {
      polDetailId,
      stage,
      subProcesses: subProcesses.map((sp) => ({
        id: sp.id,
        processName: sp.processName,
        processOrder: sp.processOrder,
        quantity: sp.quantity,
        rejectQuantity: sp.rejectQuantity,
        completed: sp.completed,
        createdBy: sp.createdBy,
        createdAt: sp.createdAt,
        updatedAt: sp.updatedAt,
      })),
    };
  }

  /**
   * Create a new stage sub-process
   */
  async createStageSubProcess(data: {
    polDetailId: string;
    stage: string;
    processName: string;
    processOrder: number;
    quantity: number;
    rejectQuantity?: number;
    createdBy: string;
  }) {
    // Validate POL detail exists
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: data.polDetailId },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    // Validate quantity
    if (data.quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', 400, 'INVALID_QUANTITY');
    }

    // Validate process order
    if (data.processOrder < 0) {
      throw new AppError('Process order must be non-negative', 400, 'INVALID_PROCESS_ORDER');
    }

    // Validate reject quantity
    if (data.rejectQuantity !== undefined && data.rejectQuantity < 0) {
      throw new AppError('Reject quantity must be non-negative', 400, 'INVALID_REJECT_QUANTITY');
    }

    const subProcess = await prisma.stageSubProcess.create({
      data: {
        id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        polDetailId: data.polDetailId,
        stage: data.stage,
        processName: data.processName,
        processOrder: data.processOrder,
        quantity: data.quantity,
        rejectQuantity: data.rejectQuantity || 0,
        completed: false,
        createdBy: data.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Run integrated validation after creation
    await this.validateSubProcessUpdate(data.polDetailId, data.stage, subProcess.id);

    return {
      id: subProcess.id,
      processName: subProcess.processName,
      processOrder: subProcess.processOrder,
      quantity: subProcess.quantity,
      rejectQuantity: subProcess.rejectQuantity,
      completed: subProcess.completed,
      createdBy: subProcess.createdBy,
      createdAt: subProcess.createdAt,
      updatedAt: subProcess.updatedAt,
    };
  }

  /**
   * Update a stage sub-process
   */
  async updateStageSubProcess(
    subProcessId: string,
    data: {
      quantity?: number;
      rejectQuantity?: number;
      completed?: boolean;
    }
  ) {
    // Find the sub-process
    const existingSubProcess = await prisma.stageSubProcess.findUnique({
      where: { id: subProcessId },
    });

    if (!existingSubProcess) {
      throw new AppError('Stage sub-process not found', 404, 'SUB_PROCESS_NOT_FOUND');
    }

    // Validate quantity if provided
    if (data.quantity !== undefined && data.quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', 400, 'INVALID_QUANTITY');
    }

    // Validate reject quantity if provided
    if (data.rejectQuantity !== undefined && data.rejectQuantity < 0) {
      throw new AppError('Reject quantity must be non-negative', 400, 'INVALID_REJECT_QUANTITY');
    }

    const updateData: any = {};
    if (data.quantity !== undefined) {
      updateData.quantity = data.quantity;
    }
    if (data.rejectQuantity !== undefined) {
      updateData.rejectQuantity = data.rejectQuantity;
    }
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
    }
    updateData.updatedAt = new Date();

    const updatedSubProcess = await prisma.stageSubProcess.update({
      where: { id: subProcessId },
      data: updateData,
    });

    // Run integrated validation after update
    await this.validateSubProcessUpdate(existingSubProcess.polDetailId, existingSubProcess.stage, subProcessId);

    return {
      id: updatedSubProcess.id,
      processName: updatedSubProcess.processName,
      processOrder: updatedSubProcess.processOrder,
      quantity: updatedSubProcess.quantity,
      rejectQuantity: updatedSubProcess.rejectQuantity,
      completed: updatedSubProcess.completed,
      createdBy: updatedSubProcess.createdBy,
      createdAt: updatedSubProcess.createdAt,
      updatedAt: updatedSubProcess.updatedAt,
    };
  }

  /**
   * Delete a stage sub-process
   */
  async deleteStageSubProcess(subProcessId: string) {
    // Find the sub-process
    const existingSubProcess = await prisma.stageSubProcess.findUnique({
      where: { id: subProcessId },
    });

    if (!existingSubProcess) {
      throw new AppError('Stage sub-process not found', 404, 'SUB_PROCESS_NOT_FOUND');
    }

    await prisma.stageSubProcess.delete({
      where: { id: subProcessId },
    });

    return { message: 'Stage sub-process deleted successfully' };
  }

  /**
   * Validate sub-process sequence - ensure sub-processes are completed in order
   * NOTE: Relaxed validation - sub-processes can now be completed in any order
   */
  private async validateSubProcessSequence(polDetailId: string, stage: string, processOrder: number): Promise<void> {
    console.log(`[validateSubProcessSequence] Checking sequence for polDetailId: ${polDetailId}, stage: ${stage}, processOrder: ${processOrder}`);
    
    // Get all sub-processes for this stage and POL detail, sorted by process order
    const subProcesses = await prisma.stageSubProcess.findMany({
      where: {
        polDetailId,
        stage,
      },
      orderBy: { processOrder: 'asc' },
    });

    console.log(`[validateSubProcessSequence] Found ${subProcesses.length} sub-processes for this stage`);
    subProcesses.forEach(sp => {
      console.log(`[validateSubProcessSequence]   - Order ${sp.processOrder}: ${sp.processName}, completed: ${sp.completed}`);
    });

    // RELAXED: Sub-processes can be completed in any order
    // Only log a warning if previous sub-processes are incomplete, but don't block
    const incompletePrevious = subProcesses.filter(
      sp => sp.processOrder < processOrder && !sp.completed
    );
    
    if (incompletePrevious.length > 0) {
      const processNames = incompletePrevious.map(sp => `${sp.processName} (order ${sp.processOrder})`).join(', ');
      console.log(`[validateSubProcessSequence] WARNING: Completing order ${processOrder} while previous sub-processes are incomplete: ${processNames}`);
      // No longer throwing error - allowing completion in any order
    }
    
    console.log(`[validateSubProcessSequence] Sequence validation passed (relaxed mode)`);
  }

  /**
   * Validate sub-process totals - ensure sub-process quantities sum to stage total
   * Special handling for SLAB/HANDBUILD products: allow sub-process creation when no stage production exists yet
   */
  private async validateSubProcessTotals(polDetailId: string, stage: string): Promise<void> {
    // Get total quantity from production records for this stage
    const stageRecords = await prisma.productionRecord.findMany({
      where: {
        polDetailId,
        stage: stage as ProductionStage,
      },
    });

    const stageTotal = stageRecords.reduce((sum, record) => sum + record.quantity, 0);

    // Get all sub-processes for this stage
    const subProcesses = await prisma.stageSubProcess.findMany({
      where: {
        polDetailId,
        stage,
      },
    });

    const subProcessTotal = subProcesses.reduce((sum, sp) => sum + sp.quantity, 0);

    // Get POL detail to check product type
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: polDetailId },
    });

    // Check if this is a SLAB or HAND_BUILT product that may not have stage production records yet
    const isSlabOrHandbuilt = detail?.productType === 'SLAB_TRAY' || detail?.productType === 'HAND_BUILT';

    // Allow sub-process creation when:
    // 1. Stage total is 0 (no production records yet) AND product is SLAB/HANDBUILT (first stage doesn't require prior stage output)
    // 2. Sub-process total doesn't exceed stage total
    if (stageTotal === 0 && isSlabOrHandbuilt) {
      // For SLAB/HANDBUILT products, allow sub-process creation when no stage production exists
      // This is because they start from a stage that doesn't depend on previous stage output
      return;
    }

    if (subProcessTotal > stageTotal) {
      throw new AppError(
        `Sub-process total (${subProcessTotal}) exceeds stage total (${stageTotal}) for stage ${stage}`,
        400,
        'QUANTITY_EXCEEDED'
      );
    }
  }

  /**
   * Validate stage against workflow - ensure stage total matches previous stage output
   */
  private async validateStageAgainstWorkflow(polDetailId: string, stage: string): Promise<void> {
    const stageOrder = ['THROWING', 'TRIMMING', 'DECORATION', 'DRYING', 'LOAD_BISQUE', 'OUT_BISQUE', 'LOAD_HIGH_FIRING', 'OUT_HIGH_FIRING', 'SANDING', 'DIPPING', 'QC_GOOD'];
    const currentIndex = stageOrder.indexOf(stage);

    if (currentIndex === 0) {
      // First stage, no previous stage to compare
      return;
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

    // Get total quantity from current stage
    const currentRecords = await prisma.productionRecord.findMany({
      where: {
        polDetailId,
        stage: stage as ProductionStage,
      },
    });

    const actualQuantity = currentRecords.reduce((sum, r) => sum + r.quantity, 0);

    const difference = actualQuantity - expectedQuantity;
    const tolerance = expectedQuantity * 0.05; // 5% tolerance

    if (Math.abs(difference) > tolerance) {
      throw new AppError(
        `Stage ${stage} quantity (${actualQuantity}) doesn't match previous stage ${previousStage} output (${expectedQuantity}). Difference: ${difference}`,
        400,
        'STAGE_MISMATCH'
      );
    }
  }

  /**
   * Integrated validation for all sub-process updates
   */
  private async validateSubProcessUpdate(polDetailId: string, stage: string, subProcessId?: string): Promise<void> {
    // Validate sub-process totals
    await this.validateSubProcessTotals(polDetailId, stage);

    // Validate stage against workflow
    await this.validateStageAgainstWorkflow(polDetailId, stage);
  }

  /**
   * Validate stage completion - ensure all sub-processes are complete before marking stage complete
   */
  private async validateStageCompletion(polDetailId: string, stage: string): Promise<void> {
    // Get all sub-processes for this stage
    const subProcesses = await prisma.stageSubProcess.findMany({
      where: {
        polDetailId,
        stage,
      },
    });

    // Check if any sub-processes are incomplete
    const incompleteProcesses = subProcesses.filter(sp => !sp.completed);

    if (incompleteProcesses.length > 0) {
      const processNames = incompleteProcesses.map(sp => `${sp.processName} (${sp.processOrder})`).join(', ');
      throw new AppError(
        `Cannot complete stage ${stage}. The following sub-processes are still incomplete: ${processNames}`,
        400,
        'INCOMPLETE_SUB_PROCESSES'
      );
    }
  }

  /**
   * Complete a stage sub-process
   * When the final sub-process is completed, automatically creates the stage production record
   */
  async completeStageSubProcess(subProcessId: string, completedBy: string) {
    // Find the sub-process
    const existingSubProcess = await prisma.stageSubProcess.findUnique({
      where: { id: subProcessId },
    });

    if (!existingSubProcess) {
      throw new AppError('Stage sub-process not found', 404, 'SUB_PROCESS_NOT_FOUND');
    }

    // Check if already completed
    if (existingSubProcess.completed) {
      throw new AppError('Stage sub-process is already completed', 400, 'ALREADY_COMPLETED');
    }

    // Validate sequence before completing (relaxed - allows any order)
    await this.validateSubProcessSequence(existingSubProcess.polDetailId, existingSubProcess.stage, existingSubProcess.processOrder);

    const updatedSubProcess = await prisma.stageSubProcess.update({
      where: { id: subProcessId },
      data: {
        completed: true,
        updatedAt: new Date(),
      },
    });

    // Check if this was the final sub-process - if so, create stage production record
    const allSubProcesses = await prisma.stageSubProcess.findMany({
      where: {
        polDetailId: existingSubProcess.polDetailId,
        stage: existingSubProcess.stage,
      },
    });

    const allCompleted = allSubProcesses.every(sp => sp.completed);
    
    if (allCompleted) {
      // Get the LAST sub-process (highest processOrder) - not the sum of all
      const sortedByOrder = [...allSubProcesses].sort((a, b) => b.processOrder - a.processOrder);
      const lastSubProcess = sortedByOrder[0];
      const lastQuantity = lastSubProcess.quantity;

      // Check if stage production record already exists
      const existingRecords = await prisma.productionRecord.findMany({
        where: {
          polDetailId: existingSubProcess.polDetailId,
          stage: existingSubProcess.stage as ProductionStage,
        },
      });

      // Only create if no records exist yet
      if (existingRecords.length === 0) {
        await prisma.productionRecord.create({
          data: {
            id: `prod-sub-${Date.now()}`,
            polDetailId: existingSubProcess.polDetailId,
            stage: existingSubProcess.stage as ProductionStage,
            quantity: lastQuantity,
            userId: completedBy,
            notes: `Auto-created from last sub-process (order: ${lastSubProcess.processOrder})`,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        console.log(`[completeStageSubProcess] Auto-created stage production record for stage ${existingSubProcess.stage}, quantity: ${lastQuantity}, from processOrder: ${lastSubProcess.processOrder}`);
      }
    }

    return {
      id: updatedSubProcess.id,
      processName: updatedSubProcess.processName,
      processOrder: updatedSubProcess.processOrder,
      quantity: updatedSubProcess.quantity,
      rejectQuantity: updatedSubProcess.rejectQuantity,
      completed: updatedSubProcess.completed,
      createdBy: updatedSubProcess.createdBy,
      createdAt: updatedSubProcess.createdAt,
      updatedAt: updatedSubProcess.updatedAt,
    };
  }
}

export const productionService = new ProductionService();
