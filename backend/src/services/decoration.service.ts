import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

interface CreateDecorationTaskData {
  polDetailId: string;
  taskName: string;
  description?: string;
  quantityRequired: number;
  userId?: string;
}

interface UpdateDecorationTaskData {
  taskName?: string;
  description?: string;
  quantityCompleted?: number;
  quantityRejected?: number;
  completed?: boolean;
  notes?: string;
}

export class DecorationService {
  /**
   * Get decoration tasks for a POL detail
   */
  async getDecorationTasks(polDetailId: string) {
    const tasks = await prisma.decorationTask.findMany({
      where: { polDetailId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      tasks,
      total: tasks.length,
      completed: tasks.filter((t) => t.completed).length,
      pending: tasks.filter((t) => !t.completed).length,
    };
  }

  /**
   * Get decoration task by ID
   */
  async getDecorationTaskById(id: string) {
    const task = await prisma.decorationTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppError('Decoration task not found', 404, 'TASK_NOT_FOUND');
    }

    return task;
  }

  /**
   * Create a new decoration task
   */
  async createDecorationTask(data: CreateDecorationTaskData) {
    // Validate POL detail exists
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: data.polDetailId },
      include: { pol: true },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    const task = await prisma.decorationTask.create({
      data: {
        polDetailId: data.polDetailId,
        taskName: data.taskName,
        description: data.description,
        quantityRequired: data.quantityRequired,
        quantityCompleted: 0,
        quantityRejected: 0,
        completed: false,
        userId: data.userId,
      },
    });

    return task;
  }

  /**
   * Update decoration task
   */
  async updateDecorationTask(id: string, data: UpdateDecorationTaskData) {
    const task = await prisma.decorationTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppError('Decoration task not found', 404, 'TASK_NOT_FOUND');
    }

    const updatedTask = await prisma.decorationTask.update({
      where: { id },
      data: {
        taskName: data.taskName,
        description: data.description,
        quantityCompleted: data.quantityCompleted,
        quantityRejected: data.quantityRejected,
        completed: data.completed,
        completedAt: data.completed ? new Date() : null,
        notes: data.notes,
      },
    });

    return updatedTask;
  }

  /**
   * Track decoration task progress
   */
  async trackDecorationTask(id: string, userId: string, data: {
    quantityCompleted?: number;
    quantityRejected?: number;
    notes?: string;
  }) {
    const task = await prisma.decorationTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppError('Decoration task not found', 404, 'TASK_NOT_FOUND');
    }

    // Update quantities
    const updateData: any = {
      quantityCompleted: data.quantityCompleted !== undefined ? data.quantityCompleted : task.quantityCompleted,
      quantityRejected: data.quantityRejected !== undefined ? data.quantityRejected : task.quantityRejected,
      notes: data.notes,
    };

    // Check if task is complete
    if (data.quantityCompleted !== undefined && data.quantityCompleted >= task.quantityRequired) {
      updateData.completed = true;
      updateData.completedAt = new Date();
    }

    const updatedTask = await prisma.decorationTask.update({
      where: { id },
      data: updateData,
    });

    return updatedTask;
  }

  /**
   * Delete decoration task
   */
  async deleteDecorationTask(id: string) {
    const task = await prisma.decorationTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppError('Decoration task not found', 404, 'TASK_NOT_FOUND');
    }

    // Check if task is completed
    if (task.completed) {
      throw new AppError('Cannot delete completed decoration task', 400, 'TASK_COMPLETED');
    }

    await prisma.decorationTask.delete({
      where: { id },
    });

    return { message: 'Decoration task deleted successfully' };
  }

  /**
   * Get decoration task statistics
   */
  async getDecorationStatistics(polDetailId?: string) {
    const where: any = polDetailId ? { polDetailId } : {};

    const [total, completed, pending, totalQuantity, completedQuantity, rejectedQuantity] =
      await Promise.all([
        prisma.decorationTask.count({ where }),
        prisma.decorationTask.count({ where: { ...where, completed: true } }),
        prisma.decorationTask.count({ where: { ...where, completed: false } }),
        prisma.decorationTask.aggregate({
          where,
          _sum: { quantityRequired: true },
        }),
        prisma.decorationTask.aggregate({
          where: { ...where, completed: true },
          _sum: { quantityCompleted: true },
        }),
        prisma.decorationTask.aggregate({
          where,
          _sum: { quantityRejected: true },
        }),
      ]);

    return {
      total,
      byStatus: {
        completed,
        pending,
      },
      quantities: {
        totalRequired: totalQuantity._sum.quantityRequired || 0,
        totalCompleted: completedQuantity._sum.quantityCompleted || 0,
        totalRejected: rejectedQuantity._sum.quantityRejected || 0,
      },
    };
  }
}

export const decorationService = new DecorationService();
