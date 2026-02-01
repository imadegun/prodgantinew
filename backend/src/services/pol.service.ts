import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { POLStatus } from '@prisma/client';

interface CreatePOLData {
  polNumber: string;
  customerName: string;
  orderDate: Date;
  deliveryDate: Date;
  notes?: string;
}

interface UpdatePOLData {
  customerName?: string;
  deliveryDate?: Date;
  notes?: string;
  status?: POLStatus;
}

interface POLFilters {
  status?: POLStatus;
  customerName?: string;
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

    if (filters.customerName) {
      where.customerName = {
        contains: filters.customerName,
        mode: 'insensitive',
      };
    }

    if (filters.startDate || filters.endDate) {
      where.orderDate = {};
      if (filters.startDate) {
        where.orderDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.orderDate.lte = filters.endDate;
      }
    }

    const [pols, total] = await Promise.all([
      prisma.pOL.findMany({
        where,
        skip,
        take: limit,
        orderBy: { orderDate: 'desc' },
        include: {
          details: {
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
        details: {
          include: {
            productionRecords: {
              orderBy: { createdAt: 'desc' },
            },
            decorationTasks: {
              orderBy: { createdAt: 'desc' },
            },
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
      where: { polNumber: data.polNumber },
    });

    if (existingPOL) {
      throw new AppError('POL number already exists', 400, 'POL_EXISTS');
    }

    const pol = await prisma.pOL.create({
      data: {
        polNumber: data.polNumber,
        customerName: data.customerName,
        orderDate: data.orderDate,
        deliveryDate: data.deliveryDate,
        notes: data.notes,
        status: 'PENDING',
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
      where: { polDetailId: detailId },
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
