import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { AlertPriority, AlertStatus } from '@prisma/client';

interface AlertFilters {
  status?: AlertStatus;
  priority?: AlertPriority;
  polId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class AlertService {
  /**
   * List alerts with pagination and filters
   */
  async listAlerts(page: number = 1, limit: number = 20, filters: AlertFilters = {}) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.polId) {
      where.polId = filters.polId;
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

    const [alerts, total] = await Promise.all([
      prisma.discrepancyAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          pol: true,
          polDetail: true,
          reportedByUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          acknowledgedByUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          resolvedByUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.discrepancyAlert.count({ where }),
    ]);

    return {
      alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get alert by ID
   */
  async getAlertById(id: string) {
    const alert = await prisma.discrepancyAlert.findUnique({
      where: { id },
      include: {
        pol: true,
        polDetail: true,
        reportedByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        acknowledgedByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
        resolvedByUser: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404, 'ALERT_NOT_FOUND');
    }

    return alert;
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(id: string, userId: string) {
    const alert = await prisma.discrepancyAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404, 'ALERT_NOT_FOUND');
    }

    if (alert.status !== 'OPEN') {
      throw new AppError('Alert is not in OPEN status', 400, 'INVALID_ALERT_STATUS');
    }

    const updatedAlert = await prisma.discrepancyAlert.update({
      where: { id },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedAt: new Date(),
        acknowledgedBy: userId,
      },
    });

    return updatedAlert;
  }

  /**
   * Resolve alert
   */
  async resolveAlert(id: string, userId: string, resolutionNotes?: string) {
    const alert = await prisma.discrepancyAlert.findUnique({
      where: { id },
    });

    if (!alert) {
      throw new AppError('Alert not found', 404, 'ALERT_NOT_FOUND');
    }

    if (alert.status === 'RESOLVED') {
      throw new AppError('Alert is already resolved', 400, 'ALERT_ALREADY_RESOLVED');
    }

    const updatedAlert = await prisma.discrepancyAlert.update({
      where: { id },
      data: {
        status: 'RESOLVED',
        resolvedAt: new Date(),
        resolvedBy: userId,
        resolutionNotes,
      },
    });

    return updatedAlert;
  }

  /**
   * Get alert statistics
   */
  async getAlertStatistics() {
    const [total, open, acknowledged, resolved, highPriority, mediumPriority, lowPriority] =
      await Promise.all([
        prisma.discrepancyAlert.count(),
        prisma.discrepancyAlert.count({ where: { status: 'OPEN' } }),
        prisma.discrepancyAlert.count({ where: { status: 'ACKNOWLEDGED' } }),
        prisma.discrepancyAlert.count({ where: { status: 'RESOLVED' } }),
        prisma.discrepancyAlert.count({ where: { priority: 'CRITICAL' } }),
        prisma.discrepancyAlert.count({ where: { priority: 'WARNING' } }),
        prisma.discrepancyAlert.count({ where: { priority: 'INFORMATIONAL' } }),
      ]);

    return {
      total,
      byStatus: {
        open,
        acknowledged,
        resolved,
      },
      byPriority: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
      },
    };
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(limit: number = 10) {
    const alerts = await prisma.discrepancyAlert.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: {
        status: {
          in: ['OPEN', 'ACKNOWLEDGED'],
        },
      },
      include: {
        pol: true,
        polDetail: true,
      },
    });

    return alerts;
  }
}

export const alertService = new AlertService();
