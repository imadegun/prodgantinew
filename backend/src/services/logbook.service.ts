import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { LogStatus } from '@prisma/client';

interface CreateLogEntryData {
  polId?: string;
  polDetailId?: string;
  userId: string;
  stage?: string;
  issueType?: any;
  description: string;
  severity?: any;
  resolution?: string;
  status?: LogStatus;
}

interface UpdateLogEntryData {
  polId?: string;
  polDetailId?: string;
  stage?: string;
  issueType?: string;
  description?: string;
  severity?: string;
  resolution?: string;
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
          pol: true,
          user: {
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
        pol: true,
        user: {
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
        polId: data.polId,
        polDetailId: data.polDetailId,
        stage: data.stage,
        issueType: data.issueType,
        description: data.description,
        severity: data.severity,
        resolution: data.resolution,
        status: data.status || 'OPEN',
        createdBy: data.userId,
      },
      include: {
        pol: true,
        user: {
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

    const updatedEntry = await prisma.logbookEntry.update({
      where: { id },
      data: data as any,
      include: {
        pol: true,
        user: {
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
      prisma.logbookEntry.count({ where: { status: 'OPEN' } }),
      prisma.logbookEntry.count({ where: { status: 'IN_PROGRESS' } }),
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
        open: normal,
        inProgress: issues,
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
        pol: true,
        user: {
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
}

export const logbookService = new LogbookService();
