import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { RevisionStatus, RevisionType, Severity } from '@prisma/client';

interface CreateRevisionData {
  polId: string;
  polDetailId?: string;
  userId: string;
  type: RevisionType;
  issueType: string;
  severity: Severity;
  description: string;
  proposedSolution?: string;
}

interface UpdateRevisionData {
  description?: string;
  proposedSolution?: string;
  managerNotes?: string;
}

interface RevisionFilters {
  status?: RevisionStatus;
  type?: RevisionType;
  severity?: Severity;
  polId?: string;
  startDate?: Date;
  endDate?: Date;
}

export class RevisionService {
  /**
   * List revision tickets with pagination and filters
   */
  async listRevisions(page: number = 1, limit: number = 20, filters: RevisionFilters = {}) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.severity) {
      where.severity = filters.severity;
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

    const [revisions, total] = await Promise.all([
      prisma.revisionTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { severity: 'desc' },
          { createdAt: 'desc' },
        ],
        include: {
          pol: {
            include: {
              polDetails: true,
            },
          },
          polDetail: true,
          creator: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          approvedByUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
      }),
      prisma.revisionTicket.count({ where }),
    ]);

    return {
      revisions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get revision ticket by ID
   */
  async getRevisionById(id: string) {
    const revision = await prisma.revisionTicket.findUnique({
      where: { id },
        include: {
          pol: {
            include: {
              polDetails: true,
            },
          },
          polDetail: true,
          creator: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
          approvedByUser: {
            select: {
              id: true,
              username: true,
              fullName: true,
            },
          },
        },
    });

    if (!revision) {
      throw new AppError('Revision ticket not found', 404, 'REVISION_NOT_FOUND');
    }

    return revision;
  }

  /**
   * Create a new revision ticket
   */
  async createRevision(data: CreateRevisionData) {
    // Validate POL exists
    const pol = await prisma.pOL.findUnique({
      where: { id: data.polId },
    });

    if (!pol) {
      throw new AppError('POL not found', 404, 'POL_NOT_FOUND');
    }

    // Validate POL detail exists if provided
    if (data.polDetailId) {
      const detail = await prisma.pOLDetail.findUnique({
        where: { id: data.polDetailId },
      });

      if (!detail) {
        throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
      }
    }

    const revision = await prisma.revisionTicket.create({
      data: {
        polId: data.polId,
        polDetailId: data.polDetailId,
        createdBy: data.userId,
        revisionType: data.type,
        issueType: data.issueType,
        severity: data.severity,
        description: data.description,
        proposedSolution: data.proposedSolution,
        status: 'DRAFT',
      } as any,
      include: {
        pol: true,
          creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return revision;
  }

  /**
   * Update revision ticket
   */
  async updateRevision(id: string, data: UpdateRevisionData) {
    const revision = await prisma.revisionTicket.findUnique({
      where: { id },
    });

    if (!revision) {
      throw new AppError('Revision ticket not found', 404, 'REVISION_NOT_FOUND');
    }

    // Only allow updates in DRAFT or REJECTED status
    if (revision.status !== 'DRAFT' && revision.status !== 'REJECTED') {
      throw new AppError('Cannot update revision in current status', 400, 'INVALID_STATUS');
    }

    const updatedRevision = await prisma.revisionTicket.update({
      where: { id },
      data,
      include: {
        pol: true,
          creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return updatedRevision;
  }

  /**
   * Submit revision for approval
   */
  async submitRevision(id: string) {
    const revision = await prisma.revisionTicket.findUnique({
      where: { id },
    });

    if (!revision) {
      throw new AppError('Revision ticket not found', 404, 'REVISION_NOT_FOUND');
    }

    if (revision.status !== 'DRAFT') {
      throw new AppError('Only DRAFT revisions can be submitted', 400, 'INVALID_STATUS');
    }

    const updatedRevision = await prisma.revisionTicket.update({
      where: { id },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    return updatedRevision;
  }

  /**
   * Approve or reject revision
   */
  async approveRevision(id: string, userId: string, approved: boolean, managerNotes?: string) {
    const revision = await prisma.revisionTicket.findUnique({
      where: { id },
    });

    if (!revision) {
      throw new AppError('Revision ticket not found', 404, 'REVISION_NOT_FOUND');
    }

    if (revision.status !== 'SUBMITTED') {
      throw new AppError('Only SUBMITTED revisions can be approved/rejected', 400, 'INVALID_STATUS');
    }

    const updatedRevision = await prisma.revisionTicket.update({
      where: { id },
      data: {
        status: approved ? 'APPROVED' : 'REJECTED',
        approvedBy: userId,
        approvedAt: new Date(),
        managerNotes,
      },
    });

    return updatedRevision;
  }

  /**
   * Delete revision ticket
   */
  async deleteRevision(id: string) {
    const revision = await prisma.revisionTicket.findUnique({
      where: { id },
    });

    if (!revision) {
      throw new AppError('Revision ticket not found', 404, 'REVISION_NOT_FOUND');
    }

    // Only allow deletion in DRAFT status
    if (revision.status !== 'DRAFT') {
      throw new AppError('Cannot delete revision in current status', 400, 'INVALID_STATUS');
    }

    await prisma.revisionTicket.delete({
      where: { id },
    });

    return { message: 'Revision ticket deleted successfully' };
  }

  /**
   * Get revision statistics
   */
  async getRevisionStatistics() {
    const [total, draft, pending, approved, rejected, highSeverity, mediumSeverity, lowSeverity] =
      await Promise.all([
        prisma.revisionTicket.count(),
        prisma.revisionTicket.count({ where: { status: 'DRAFT' } }),
        prisma.revisionTicket.count({ where: { status: 'SUBMITTED' } }),
        prisma.revisionTicket.count({ where: { status: 'APPROVED' } }),
        prisma.revisionTicket.count({ where: { status: 'REJECTED' } }),
        prisma.revisionTicket.count({ where: { severity: 'HIGH' } }),
        prisma.revisionTicket.count({ where: { severity: 'MEDIUM' } }),
        prisma.revisionTicket.count({ where: { severity: 'LOW' } }),
      ]);

    return {
      total,
      byStatus: {
        draft,
        pending,
        approved,
        rejected,
      },
      bySeverity: {
        high: highSeverity,
        medium: mediumSeverity,
        low: lowSeverity,
      },
    };
  }

  /**
   * Get recent revision tickets
   */
  async getRecentRevisions(limit: number = 10) {
    const revisions = await prisma.revisionTicket.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      where: {
        status: {
          in: ['DRAFT', 'SUBMITTED'],
        },
      },
      include: {
        pol: true,
          creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    return revisions;
  }
}

export const revisionService = new RevisionService();
