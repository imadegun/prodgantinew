import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { POLStatus } from '@prisma/client';

interface CreatePOLData {
  poNumber: string;
  clientName: string;
  poDate: Date;
  deliveryDate: Date;
  notes?: string;
  createdBy: string;
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
  async getPOLById(id: string) {
    const pol = await prisma.pOL.findUnique({
      where: { id },
      include: {
        polDetails: {
          include: {
            production_records: {
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            decoration_tasks: {
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

    // Validate that createdBy is provided
    if (!data.createdBy) {
      throw new AppError('Created by user is required', 400, 'CREATED_BY_REQUIRED');
    }

    const pol = await prisma.pOL.create({
      data: {
        id: `pol-${Date.now()}`,
        poNumber: data.poNumber,
        clientName: data.clientName,
        poDate: data.poDate,
        deliveryDate: data.deliveryDate,
        notes: data.notes,
        createdBy: data.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: POLStatus.PENDING,
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
      data: {
        ...data,
        updatedAt: new Date(),
      },
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
        production_records: {
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
   * Automatically determines productType from product's BuildTech in MySQL
   * BuildTech is the source of truth - always override any frontend-provided productType
   */
  async addProductToPOL(polId: string, productData: any) {
    console.log('[addProductToPOL] Called with productData:', JSON.stringify(productData));
    
    const pol = await prisma.pOL.findUnique({
      where: { id: polId },
    });

    if (!pol) {
      throw new AppError('POL not found', 404, 'POL_NOT_FOUND');
    }

    // ALWAYS determine productType from BuildTech (source of truth is MySQL gayafusionall)
    let productType = 'PLAIN'; // default fallback
    
    if (productData.productCode) {
      console.log(`[addProductToPOL] Looking up BuildTech for productCode: ${productData.productCode}`);
      try {
        const { productService } = await import('./product.service');
        const productInfo = await productService.getProductProductionInfo(productData.productCode);
        
        console.log(`[addProductToPOL] Product info retrieved:`, productInfo ? {
          productCode: productInfo.productCode,
          buildTech: productInfo.buildTech,
          buildTechNote: productInfo.buildTechNote
        } : 'null');
        
        if (productInfo?.buildTech) {
          const buildTech = productInfo.buildTech.toUpperCase();
          console.log(`[addProductToPOL] BuildTech (uppercase): "${buildTech}"`);
          
          // Map BuildTech to productType
          if (buildTech.includes('HANDBUILD') || buildTech.includes('HAND BUILD') || buildTech.includes('HANDMADE') || buildTech.includes('HAND MADE')) {
            productType = 'HAND_BUILT';
          } else if (buildTech.includes('SLAB') || buildTech.includes('SLABING') || buildTech.includes('SLAB & ESTRUDER') || buildTech.includes('SLAB TRAY')) {
            productType = 'SLAB_TRAY';
          } else if (buildTech.includes('DECOR') || buildTech.includes('DECORATIVE')) {
            productType = 'DECOR';
          } else {
            productType = 'PLAIN';
          }
          
          console.log(`[addProductToPOL] Product ${productData.productCode}: BuildTech="${productInfo.buildTech}" -> productType="${productType}"`);
        } else {
          console.log(`[addProductToPOL] Product ${productData.productCode}: No BuildTech found in MySQL, using default productType="PLAIN"`);
        }
      } catch (error: any) {
        console.error('[addProductToPOL] Error determining productType from BuildTech:', error.message);
        // Fall back to default
        productType = 'PLAIN';
      }
    } else {
      console.log('[addProductToPOL] No productCode provided, using default productType="PLAIN"');
    }

    console.log(`[addProductToPOL] Creating POLDetail with productType="${productType}"`);
    
    const detail = await prisma.pOLDetail.create({
      data: {
        id: `detail-${Date.now()}`,
        polId,
        productCode: productData.productCode,
        productName: productData.productName,
        quantity: productData.quantity,
        productType,
        color: productData.color,
        texture: productData.texture,
        material: productData.material,
        size: productData.size,
        finalSize: productData.finalSize,
        notes: productData.notes,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log(`[addProductToPOL] POLDetail created with id=${detail.id}, productType="${detail.productType}"`);
    
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
      data: {
        ...data,
        updatedAt: new Date(),
      },
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
