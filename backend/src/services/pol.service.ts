import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { POLStatus } from '@prisma/client';

interface CreatePOLData {
  poNumber: string;
  clientName: string;
  poDate: Date;
  deliveryDate: Date;
  notes?: string;
  createdBy?: number;
}

interface UpdatePOLData {
  clientName?: string;
  deliveryDate?: Date;
  notes?: string;
  status?: POLStatus;
}

interface POLFilters {
  status?: POLStatus | string;
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

    const statusFilter = filters.status as string;
    if (statusFilter && statusFilter !== 'All') {
      where.status = statusFilter as POLStatus;
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
          _count: {
            select: { polDetails: true },
          },
          polDetails: {
            select: {
              quantity: true,
            },
          },
        },
      }),
      prisma.pOL.count({ where }),
    ]);

    // Transform the result to include totalOrder count, totalQuantity sum, and polId alias
    const polsWithTotalOrder = pols.map((pol: any) => {
      const totalQuantity = pol.polDetails?.reduce((sum: number, detail: any) => sum + (detail.quantity || 0), 0) || 0;
      return {
        ...pol,
        polId: pol.id, // Add polId as alias for id
        totalOrder: pol._count?.polDetails || 0,
        totalQuantity: totalQuantity,
      };
    });

    return {
      pols: polsWithTotalOrder,
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
  async getPOLById(id: number) {
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

    // Validate that createdBy is provided and is a valid number
    // This field is required by the database schema (non-nullable integer)
    if (data.createdBy === undefined) {
      throw new AppError('Created by user is required', 400, 'CREATED_BY_REQUIRED');
    }

    const pol = await prisma.pOL.create({
      data: {
        poNumber: data.poNumber,
        clientName: data.clientName,
        poDate: data.poDate,
        deliveryDate: data.deliveryDate,
        notes: data.notes,
        createdBy: data.createdBy,
        updatedAt: new Date(),
        status: POLStatus.DRAFT,
      },
    });

    return pol;
  }

  /**
   * Update POL
   */
  async updatePOL(id: number, data: UpdatePOLData) {
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
  async deletePOL(id: number) {
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
  async addProductToPOL(polId: number, productData: any) {
    const pol = await prisma.pOL.findUnique({
      where: { id: polId },
    });

    if (!pol) {
      throw new AppError('POL not found', 404, 'POL_NOT_FOUND');
    }

    // Calculate qtyToMake based on quantity and extra buffer (always auto-calculate)
    const quantity = productData.quantity || 0;
    const extraBuffer = productData.extraBuffer || 15; // Default 15%
    const qtyToMake = Math.round(quantity + (quantity * extraBuffer / 100));

    const detail = await prisma.pOLDetail.create({
      data: {
        polId,
        productCode: productData.productCode,
        productName: productData.productName,
        quantity: quantity,
        extraBuffer: extraBuffer,
        qtyToMake: qtyToMake,
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
  async updatePOLDetail(detailId: number, data: any) {
    const detail = await prisma.pOLDetail.findUnique({
      where: { id: detailId },
    });

    if (!detail) {
      throw new AppError('POL detail not found', 404, 'DETAIL_NOT_FOUND');
    }

    // Recalculate qtyToMake if quantity or extraBuffer is being updated
    let updateData = { ...data };
    
    if (data.quantity !== undefined || data.extraBuffer !== undefined) {
      const quantity = data.quantity !== undefined ? data.quantity : detail.quantity;
      const extraBuffer = data.extraBuffer !== undefined ? data.extraBuffer : detail.extraBuffer;
      updateData.qtyToMake = Math.round(quantity + (quantity * extraBuffer / 100));
    }

    const updatedDetail = await prisma.pOLDetail.update({
      where: { id: detailId },
      data: updateData,
    });

    return updatedDetail;
  }

  /**
   * Delete POL detail
   */
  async deletePOLDetail(detailId: number) {
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
