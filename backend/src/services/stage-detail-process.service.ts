import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export interface StageDetailProcess {
  id: string;
  stageId: string;
  processName: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProcessDTO {
  processName: string;
  sortOrder?: number;
}

export interface UpdateProcessDTO {
  processName?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export class StageDetailProcessService {
  /**
   * Get all processes for a stage
   */
  async getProcessesByStageId(stageId: string): Promise<StageDetailProcess[]> {
    try {
      const processes = await prisma.stageDetailProcess.findMany({
        where: {
          stageId,
          isActive: true,
        },
        orderBy: { sortOrder: 'asc' },
      });

      return processes;
    } catch (error: any) {
      console.error('Error getting processes by stage ID:', error);
      throw new AppError('Failed to get processes', 500, 'GET_PROCESSES_ERROR');
    }
  }

  /**
   * Get process by ID
   */
  async getProcessById(id: string): Promise<StageDetailProcess | null> {
    try {
      const process = await prisma.stageDetailProcess.findUnique({
        where: { id },
      });

      return process;
    } catch (error: any) {
      console.error('Error getting process by ID:', error);
      throw new AppError('Failed to get process', 500, 'GET_PROCESS_ERROR');
    }
  }

  /**
   * Create a new process for a stage
   */
  async createProcess(stageId: string, data: CreateProcessDTO): Promise<StageDetailProcess> {
    try {
      // Verify stage exists and has detail process enabled
      const stage = await prisma.productionStageConfig.findUnique({
        where: { id: stageId },
      });

      if (!stage) {
        throw new AppError('Stage not found', 404, 'STAGE_NOT_FOUND');
      }

      if (!stage.hasDetailProcess) {
        throw new AppError('Stage does not have detail process enabled', 400, 'DETAIL_PROCESS_DISABLED');
      }

      const process = await prisma.stageDetailProcess.create({
        data: {
          id: `proc-${Date.now()}`,
          stageId,
          processName: data.processName,
          sortOrder: data.sortOrder || 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      return process;
    } catch (error: any) {
      console.error('Error creating process:', error);
      if (error instanceof AppError) {
        throw error;
      }
      if (error.code === 'P2002') {
        throw new AppError('Process name already exists for this stage', 400, 'PROCESS_NAME_EXISTS');
      }
      throw new AppError('Failed to create process', 500, 'CREATE_PROCESS_ERROR');
    }
  }

  /**
   * Update a process
   */
  async updateProcess(id: string, data: UpdateProcessDTO): Promise<StageDetailProcess> {
    try {
      const process = await prisma.stageDetailProcess.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      return process;
    } catch (error: any) {
      console.error('Error updating process:', error);
      if (error.code === 'P2025') {
        throw new AppError('Process not found', 404, 'PROCESS_NOT_FOUND');
      }
      throw new AppError('Failed to update process', 500, 'UPDATE_PROCESS_ERROR');
    }
  }

  /**
   * Delete a process (soft delete)
   */
  async deleteProcess(id: string): Promise<void> {
    try {
      await prisma.stageDetailProcess.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error('Error deleting process:', error);
      if (error.code === 'P2025') {
        throw new AppError('Process not found', 404, 'PROCESS_NOT_FOUND');
      }
      throw new AppError('Failed to delete process', 500, 'DELETE_PROCESS_ERROR');
    }
  }

  /**
   * Bulk create processes for a stage
   */
  async bulkCreateProcesses(stageId: string, processes: CreateProcessDTO[]): Promise<StageDetailProcess[]> {
    try {
      // Verify stage exists and has detail process enabled
      const stage = await prisma.productionStageConfig.findUnique({
        where: { id: stageId },
      });

      if (!stage) {
        throw new AppError('Stage not found', 404, 'STAGE_NOT_FOUND');
      }

      if (!stage.hasDetailProcess) {
        throw new AppError('Stage does not have detail process enabled', 400, 'DETAIL_PROCESS_DISABLED');
      }

      const createdProcesses = await Promise.all(
        processes.map((process, index) =>
          prisma.stageDetailProcess.create({
            data: {
              id: `proc-${Date.now()}-${index}`,
              stageId,
              processName: process.processName,
              sortOrder: process.sortOrder ?? index,
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          })
        )
      );

      return createdProcesses;
    } catch (error: any) {
      console.error('Error bulk creating processes:', error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to bulk create processes', 500, 'BULK_CREATE_PROCESSES_ERROR');
    }
  }
}

export const stageDetailProcessService = new StageDetailProcessService();
