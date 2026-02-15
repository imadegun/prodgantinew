import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { POLStatus } from '@prisma/client';

interface CreatePOLData {
  poNumber: string;
  clientName: string;
  poDate: Date;
  deliveryDate: Date;
  notes?: string;
}

interface UpdatePOLData {
  clientName?: string;
  deliveryDate?: Date;
  notes?: string;
  status?: POLStatus;
}

interface POLFilters {
  status?: POLStatus;
  clientName?: string;
  startDate?: Date;
  endDate?: Date;
}

export class POLService {
  /**
   * List POLs with pagination and filters
   */
  async listPOLs(page: number = 1, limit: number = 20, filters: POLFilters = {}) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.clientName) {
      where.clientName = {
        contains: filters.clientName,
        mode: 'insensitive',
      };
    }

    if (filters.startDate || filters.endDate) {
      where.poDate = {};
      if (filters.startDate) {
        where.poDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.poDate.lte = filters.endDate;
      }
    }

    const [pols, total] = await Promise.all([
      prisma.pOL.findMany({
        where,
        skip,
        take: limit,
        orderBy: { poDate: 'desc' },
        include: {
          polDetails: {
            include: {
              productionRecords: {
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      }),
      prisma.pOL.count({ where }),
    ]);

    return {
      pols,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get POL by ID with full details
   */
  async getPOLById(id: string) {
    const pol = await prisma.pOL.findUnique({
      where: { id },
      include: {
        polDetails: {
          include: {
            productionRecords: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            decorationTasks: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        creator: {
          select: {
            id: true,
            username: true,
            fullName: true,
          },
        },
      },
    });

    if (!pol) {
      throw new AppError('POL not found', 404, 'POL_NOT_FOUND');
    }

    return pol;
  }

  /**
   * Create a new POL
   */
  async createPOL(data: CreatePOLData) {
    // Check if POL number already exists
    const existingPOL = await prisma.pOL.findUnique({
      where: { poNumber: data.poNumber },
    });

    if (existingPOL) {
      throw new AppError('POL number already exists', 400, 'POL_EXISTS');
    }

    const pol = await prisma.pOL.create({
      data: {
        poNumber: data.poNumber,
        clientName: data.clientName,
        poDate: data.poDate,
        deliveryDate: data.deliveryDate,
        notes: data.notes,
        status: 'DRAFT',
      },
    });

    return pol;
  }

  /**
   * Update POL
   */
  async updatePOL(id: string, data: UpdatePOLData) {
    const pol = await prisma.pOL.findUnique({
      where: { id },
    });

    if (!pol) {
      throw new AppError('POL not found', 404, 'POL_NOT_FOUND');
    }

    const updatedPOL = await prisma.pOL.update({
      where: { id },
      data,
    });

    return updatedPOL;
  }

  /**
   * Delete POL
   */
  async deletePOL(id: string) {
    const pol = await prisma.pOL.findUnique({
      where: { id },
    });

    if (!pol) {
      throw new AppError('POL not found', 404, 'POL_NOT_FOUND');
    }

    // Check if POL has production records
    const hasProductionRecords = await prisma.pOLDetail.findFirst({
      where: {
        polId: id,
        productionRecords: {
          some: {},
        },
      },
    });

    if (hasProductionRecords) {
      throw new AppError('Cannot delete POL with production records', 400, 'POL_HAS_RECORDS');
    }

    await prisma.pOL.delete({
      where: { id },
    });

    return { message: 'POL deleted successfully' };
  }

  /**
   * Add product to POL
   */
  async addProductToPOL(polId: string, productData: any) {
    const pol = await prisma.pOL.findUnique({
      where: { id: polId },
    });

    if (!pol) {
      throw new AppError('POL not found', 404, 'POL_NOT_FOUND');
    }

    const detail = await prisma.pOLDetail.create({
      data: {
        polId,
        productCode: productData.productCode,
        productName: productData.productName,
        quantity: productData.quantity,
        productType: productData.productType || 'PLAIN',
        color: productData.color,
        texture: productData.texture,
        material: productData.material,
        size: productData.size,
        finalSize: productData.finalSize,
        notes: productData.notes,
      },
    });

    return detail;
  }

  /**
   * Update POL detail
   */
  async updatePOLDetail(detailId: string, data: any) {
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: detailId },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    const updatedDetail = await prisma.pOLDetail.update({
      where: { id: detailId },
      data,
    });

    return updatedDetail;
  }

  /**
   * Delete POL detail
   */
  async deletePOLDetail(detailId: string) {
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: detailId },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    // Check if detail has production records
    const hasProductionRecords = await prisma.productionRecord.findFirst({
      where: {
        polDetailId: detailId,
      },
    });

    if (hasProductionRecords) {
      throw new AppError('Cannot delete product with production records', 400, 'DETAIL_HAS_RECORDS');
    }

    await prisma.pOLDetail.delete({
      where: { id: detailId },
    });

    return { message: 'Product removed from POL successfully' };
  }
}

export const polService = new POLService();
