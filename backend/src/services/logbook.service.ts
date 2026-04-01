import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { LogStatus, ProductionStage } from '@prisma/client';

interface CreateLogEntryData {
  polId?: string;
  polDetailId?: string;
  userId: string;
  stage?: ProductionStage;
  issueType?: string;
  description: string;
  severity?: string;
  actions?: string;
  status?: LogStatus;
}

interface UpdateLogEntryData {
  polId?: string;
  polDetailId?: string;
  stage?: ProductionStage;
  issueType?: string;
  description?: string;
  severity?: string;
  actions?: string;
  status?: LogStatus;
  notes?: string;
}

interface LogFilters {
  polId?: string;
  userId?: string;
  status?: LogStatus;
  startDate?: Date;
  endDate?: Date;
}

export class LogbookService {
  /**
   * List logbook entries with pagination and filters
   */
  async listLogEntries(page: number = 1, limit: number = 20, filters: LogFilters = {}) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.polId) {
      where.polId = filters.polId;
    }

    if (filters.userId) {
      where.userId = filters.userId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      where.createdAt = {};
      if (filters.startDate) {
        where.createdAt.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.createdAt.lte = filters.endDate;
      }
    }

    const [entries, total] = await Promise.all([
      prisma.logbookEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          pols: true,
          users: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.logbookEntry.count({ where }),
    ]);

    return {
      entries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get log entry by ID
   */
  async getLogEntryById(id: string) {
    const entry = await prisma.logbookEntry.findUnique({
      where: { id },
      include: {
        pols: true,
        users: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    if (!entry) {
      throw new AppError('Log entry not found', 404, 'LOG_ENTRY_NOT_FOUND');
    }

    return entry;
  }

  /**
   * Create a new log entry
   */
  async createLogEntry(data: CreateLogEntryData) {
    // Validate POL exists if provided
    if (data.polId) {
      const pol = await prisma.pOL.findUnique({
        where: { id: data.polId },
      });

      if (!pol) {
        throw new AppError('POL not found', 404, 'POL_NOT_FOUND');
      }
    }

    const entry = await prisma.logbookEntry.create({
      data: {
        id: `log-${Date.now()}`,
        polId: data.polId,
        polDetailId: data.polDetailId,
        userId: data.userId,
        entryDate: new Date(),
        status: data.status || 'NORMAL',
        notes: data.description,
        issues: data.issueType,
        actions: data.actions,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      include: {
        pols: true,
        users: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return entry;
  }

  /**
   * Update log entry
   */
  async updateLogEntry(id: string, data: UpdateLogEntryData) {
    const entry = await prisma.logbookEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new AppError('Log entry not found', 404, 'LOG_ENTRY_NOT_FOUND');
    }

    // Validate POL exists if provided
    if (data.polId) {
      const pol = await prisma.pOL.findUnique({
        where: { id: data.polId },
      });

      if (!pol) {
        throw new AppError('POL not found', 404, 'POL_NOT_FOUND');
      }
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.polId !== undefined) updateData.polId = data.polId;
    if (data.polDetailId !== undefined) updateData.polDetailId = data.polDetailId;
    if (data.stage !== undefined) updateData.stage = data.stage;
    if (data.issueType !== undefined) updateData.issues = data.issueType;
    if (data.description !== undefined) updateData.notes = data.description;
    if (data.severity !== undefined) updateData.severity = data.severity;
    if (data.actions !== undefined) updateData.actions = data.actions;
    if (data.status !== undefined) updateData.status = data.status;

    const updatedEntry = await prisma.logbookEntry.update({
      where: { id },
      data: updateData,
      include: {
        pols: true,
        users: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return updatedEntry;
  }

  /**
   * Delete log entry
   */
  async deleteLogEntry(id: string) {
    const entry = await prisma.logbookEntry.findUnique({
      where: { id },
    });

    if (!entry) {
      throw new AppError('Log entry not found', 404, 'LOG_ENTRY_NOT_FOUND');
    }

    await prisma.logbookEntry.delete({
      where: { id },
    });

    return { message: 'Log entry deleted successfully' };
  }

  /**
   * Get logbook statistics
   */
  async getLogbookStatistics() {
    const [total, normal, issues, resolved, todayEntries] = await Promise.all([
      prisma.logbookEntry.count(),
      prisma.logbookEntry.count({ where: { status: 'NORMAL' } }),
      prisma.logbookEntry.count({ where: { status: 'ISSUES' } }),
      prisma.logbookEntry.count({ where: { status: 'RESOLVED' } }),
      prisma.logbookEntry.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
    ]);

    return {
      total,
      byStatus: {
        normal,
        issues,
        resolved,
      },
      todayEntries,
    };
  }

  /**
   * Get recent log entries
   */
  async getRecentEntries(limit: number = 10) {
    const entries = await prisma.logbookEntry.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        pols: true,
        users: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });
 
    return entries;
  }

  /**
   * Get all log entries (alias for listLogEntries)
   */
  async getAll(params?: LogFilters) {
    return this.listLogEntries(1, 20, params);
  }
}
 
export const logbookService = new LogbookService();
