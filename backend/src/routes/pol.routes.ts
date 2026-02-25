import { Router } from 'express';
import { authenticate, authorize, AuthenticatedRequest } from '../middleware/auth.middleware';
import { polService } from '../services/pol.service';

const router = Router();

// Get all POLs
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, clientName, fromDate, toDate } = req.query;
    
    let filters: any = {};
    if (status) filters.status = status;
    if (clientName) filters.clientName = clientName;
    if (fromDate) {
      filters.startDate = new Date(fromDate as string);
    }
    if (toDate) {
      filters.endDate = new Date(toDate as string);
    }
    
    const result = await polService.listPOLs(
      Number(page),
      Number(limit),
      filters
    );
    
    // Transform response to match frontend expectations
    res.json({
      success: true,
      data: {
        pols: result.pols,
        meta: result.pagination,
      },
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_POLs_FAILED',
        message: error.message || 'Failed to fetch POLs',
      },
    });
  }
});

// Get POL by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const polId = parseInt(id, 10);
    
    const result = await polService.getPOLById(polId);
    
    // Transform response to match frontend expectations
    // Frontend expects { pol, details } but backend returns POL with polDetails
    res.json({
      success: true,
      data: {
        pol: {
          id: result.id,
          polId: result.id,
          poNumber: result.poNumber,
          clientName: result.clientName,
          totalOrder: result.polDetails?.length || 0,
          poDate: result.poDate,
          deliveryDate: result.deliveryDate,
          status: result.status,
          createdAt: result.createdAt,
          updatedAt: result.updatedAt,
          createdBy: result.creator,
        },
        details: result.polDetails?.map((detail: any) => ({
          id: detail.id,
          polId: detail.polId,
          productCode: detail.productCode,
          productName: detail.productName,
          color: detail.color,
          texture: detail.texture,
          material: detail.material,
          size: detail.size,
          finalSize: detail.finalSize,
          orderQuantity: detail.quantity,
          extraBuffer: detail.extraBuffer || 0,
          currentStage: detail.currentStage || 'FORMING',
          productionProgress: detail.productionProgress || 0,
          buildNotes: detail.notes || '',
          createdAt: detail.createdAt,
          updatedAt: detail.updatedAt,
        })) || [],
      },
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_POL_FAILED',
        message: error.message || 'Failed to fetch POL',
      },
    });
  }
});

// Create POL
router.post('/', authenticate, authorize('MANAGER'), async (req: AuthenticatedRequest, res) => {
  try {
    const { poNumber, clientName, poDate, deliveryDate, products } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'User not authenticated' }
      });
      return;
    }
    
    const result = await polService.createPOL({
      poNumber,
      clientName,
      poDate: poDate ? new Date(poDate) : new Date(),
      deliveryDate: new Date(deliveryDate),
      notes: '',
      createdBy: userId,
    });
    
    // Products will be added separately via the add-product endpoint
    // for (const product of products || []) {
    //   await polService.addProductToPOL(result.id, {
    //     productCode: product.productCode,
    //     productName: product.productName,
    //     quantity: product.orderQuantity || product.quantity || 1,
    //     color: product.color,
    //     texture: product.texture,
    //     material: product.material,
    //     size: product.size,
    //     finalSize: product.finalSize,
    //     notes: product.notes,
    //   });
    // }
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'POL created successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CREATE_POL_FAILED',
        message: error.message || 'Failed to create POL',
      },
    });
  }
});

// Update POL
router.put('/:id', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const polId = parseInt(id, 10);
    const { clientName, deliveryDate, status } = req.body;
    
    const updateData: any = {};
    if (clientName !== undefined) {
      updateData.clientName = clientName;
    }
    if (deliveryDate !== undefined) {
      updateData.deliveryDate = new Date(deliveryDate);
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    
    const result = await polService.updatePOL(polId, updateData);
    
    res.json({
      success: true,
      data: result,
      message: 'POL updated successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_POL_FAILED',
        message: error.message || 'Failed to update POL',
      },
    });
  }
});

// Delete POL
router.delete('/:id', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const polId = parseInt(id, 10);
    
    await polService.deletePOL(polId);
    
    res.json({
      success: true,
      message: 'POL deleted successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'DELETE_POL_FAILED',
        message: error.message || 'Failed to delete POL',
      },
    });
  }
});

// Update POL Detail
router.put('/details/:detailId', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    const { detailId } = req.params;
    const { productCode, productName, color, material, size, quantity } = req.body;
    
    const updateData: any = {};
    if (productCode !== undefined) updateData.productCode = productCode;
    if (productName !== undefined) updateData.productName = productName;
    if (color !== undefined) updateData.color = color;
    if (material !== undefined) updateData.material = material;
    if (size !== undefined) updateData.size = size;
    if (quantity !== undefined) updateData.quantity = quantity;
    
    const result = await polService.updatePOLDetail(parseInt(detailId, 10), updateData);
    
    res.json({
      success: true,
      data: result,
      message: 'POL detail updated successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_POL_DETAIL_FAILED',
        message: error.message || 'Failed to update POL detail',
      },
    });
  }
});

// Delete POL Detail
router.delete('/details/:detailId', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    const { detailId } = req.params;
    
    await polService.deletePOLDetail(parseInt(detailId, 10));
    
    res.json({
      success: true,
      message: 'POL detail deleted successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'DELETE_POL_DETAIL_FAILED',
        message: error.message || 'Failed to delete POL detail',
      },
    });
  }
});

// Add product to POL
router.post('/:id/products', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const polId = parseInt(id, 10);
    const { productCode, productName, quantity, color, texture, material, size, finalSize, notes } = req.body;
    
    if (!productCode || !productName || !quantity) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Product code, name, and quantity are required',
        },
      });
      return;
    }
    
    const result = await polService.addProductToPOL(polId, {
      productCode,
      productName,
      quantity,
      color,
      texture,
      material,
      size,
      finalSize,
      notes,
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Product added to POL successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'ADD_PRODUCT_FAILED',
        message: error.message || 'Failed to add product to POL',
      },
    });
  }
});

export default router;
