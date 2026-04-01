import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';

interface CreateDecorationTaskData {
  polDetailId: string;
  taskName: string;
  description?: string;
  quantity: number;
  userId?: string;
}

interface UpdateDecorationTaskData {
  taskName?: string;
  description?: string;
  quantity?: number;
  completed?: boolean;
  completedAt?: Date;
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
        id: `task-${Date.now()}`,
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

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.taskName !== undefined) updateData.taskName = data.taskName;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      if (data.completed) {
        updateData.completedAt = new Date();
      }
    }
    if (data.completedAt !== undefined) updateData.completedAt = data.completedAt;

    const updatedTask = await prisma.decorationTask.update({
      where: { id },
      data: updateData,
    });

    return updatedTask;
  }

  /**
   * Track decoration task progress
   */
  async trackDecorationTask(id: string, userId: string, data: {
    quantity?: number;
    completed?: boolean;
    description?: string;
  }) {
    const task = await prisma.decorationTask.findUnique({
      where: { id },
    });

    if (!task) {
      throw new AppError('Decoration task not found', 404, 'TASK_NOT_FOUND');
    }

    // Update quantities
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.quantity !== undefined) updateData.quantity = data.quantity;
    if (data.completed !== undefined) {
      updateData.completed = data.completed;
      if (data.completed) {
        updateData.completedAt = new Date();
      }
    }
    if (data.description !== undefined) updateData.description = data.description;

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

    const [total, completed, pending, totalQuantity, completedQuantity] =
      await Promise.all([
        prisma.decorationTask.count({ where }),
        prisma.decorationTask.count({ where: { ...where, completed: true } }),
        prisma.decorationTask.count({ where: { ...where, completed: false } }),
        prisma.decorationTask.aggregate({
          where,
          _sum: { quantity: true },
        }),
        prisma.decorationTask.aggregate({
          where: { ...where, completed: true },
          _sum: { quantity: true },
        }),
      ]);

    return {
      total,
      byStatus: {
        completed,
        pending,
      },
      quantities: {
        totalRequired: totalQuantity._sum.quantity || 0,
        totalCompleted: completedQuantity._sum.quantity || 0,
      },
    };
  }
}

export const decorationService = new DecorationService();
