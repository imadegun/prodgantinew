import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { productionService } from '../services/production.service';

const router = Router();

// Get production stages for a product
router.get('/:polDetailId/stages', authenticate, async (req, res) => {
  try {
    let { polDetailId } = req.params;
    
    // Handle invalid IDs (like NaN)
    if (polDetailId === 'NaN' || !polDetailId) {
      const referer = req.headers.referer || req.headers.referrer;
      if (referer) {
        const refererStr = Array.isArray(referer) ? referer[0] : referer;
        const match = refererStr.match(/\/stages\/([^/?]+)/);
        if (match && match[1] && match[1] !== 'NaN') {
          polDetailId = match[1];
        }
      }
    }
    
    if (!polDetailId || polDetailId === 'NaN') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid POL detail ID',
        },
      });
    }
    
    const result = await productionService.getProductionStages(polDetailId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_STAGES_FAILED',
        message: error.message || 'Failed to fetch production stages',
      },
    });
  }
});

// Track production quantity
router.post('/track', authenticate, async (req, res) => {
  try {
    const { polDetailId, stage, quantity, notes } = req.body;
    const authReq = req as any;
    
    const result = await productionService.trackProduction({
      polDetailId,
      stage,
      quantity,
      userId: authReq.user.userId,
      notes,
    });
    
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'TRACK_PRODUCTION_FAILED',
        message: error.message || 'Failed to track production',
      },
    });
  }
});

// Get active production tasks
router.get('/active', authenticate, async (req, res) => {
  try {
    const authReq = req as any;
    const result = await productionService.getActiveTasks(authReq.user.userId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_ACTIVE_TASKS_FAILED',
        message: error.message || 'Failed to fetch active tasks',
      },
    });
  }
});

// Get decoration tasks for a POL detail
router.get('/decorations/:polDetailId', authenticate, async (req, res) => {
  try {
    let { polDetailId } = req.params;
    
    // Handle invalid IDs (like NaN)
    if (polDetailId === 'NaN' || !polDetailId) {
      const referer = req.headers.referer || req.headers.referrer;
      if (referer) {
        const refererStr = Array.isArray(referer) ? referer[0] : referer;
        const match = refererStr.match(/\/decorations\/([^/?]+)/);
        if (match && match[1] && match[1] !== 'NaN') {
          polDetailId = match[1];
        }
      }
    }
    
    if (!polDetailId || polDetailId === 'NaN') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid POL detail ID',
        },
      });
    }
    
    const result = await productionService.getDecorationTasks(polDetailId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_DECORATION_TASKS_FAILED',
        message: error.message || 'Failed to fetch decoration tasks',
      },
    });
  }
});

// Create a new decoration task
router.post('/decorations', authenticate, async (req, res) => {
  try {
    const { polDetailId, taskName, description, quantity, userId } = req.body;
    
    const result = await productionService.createDecorationTask({
      polDetailId,
      taskName,
      description,
      quantity,
      userId,
    });
    
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CREATE_DECORATION_TASK_FAILED',
        message: error.message || 'Failed to create decoration task',
      },
    });
  }
});

// Update a decoration task
router.put('/decorations/:taskId', authenticate, async (req, res) => {
  try {
    const { taskId } = req.params;
    const { quantity, completed, completedAt } = req.body;
    
    const result = await productionService.updateDecorationTask(taskId, {
      quantity,
      completed,
      completedAt: completedAt ? new Date(completedAt) : undefined,
    });
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_DECORATION_TASK_FAILED',
        message: error.message || 'Failed to update decoration task',
      },
    });
  }
});

// Delete a decoration task
router.delete('/decorations/:taskId', authenticate, async (req, res) => {
  try {
    const { taskId } = req.params;
    
    const result = await productionService.deleteDecorationTask(taskId);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'DELETE_DECORATION_TASK_FAILED',
        message: error.message || 'Failed to delete decoration task',
      },
    });
  }
});

// Get all ovens
router.get('/ovens', authenticate, async (req, res) => {
  try {
    const result = await productionService.getOvens();
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_OVENS_FAILED',
        message: error.message || 'Failed to fetch ovens',
      },
    });
  }
});

// Get products for a POL (for dropdown selection)
router.get('/products/:polId', authenticate, async (req, res) => {
  try {
    let { polId } = req.params;
    
    // Handle invalid IDs (like NaN)
    if (polId === 'NaN' || !polId) {
      const referer = req.headers.referer || req.headers.referrer;
      if (referer) {
        const refererStr = Array.isArray(referer) ? referer[0] : referer;
        const match = refererStr.match(/\/products\/([^/?]+)/);
        if (match && match[1] && match[1] !== 'NaN') {
          polId = match[1];
        }
      }
    }
    
    if (!polId || polId === 'NaN') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid POL ID',
        },
      });
    }
    
    const { polService } = await import('../services/pol.service');
    
    const pol = await polService.getPOLById(polId);
    
    // Transform polDetails to a format suitable for dropdown
    const products = (pol.polDetails || []).map((detail: any) => ({
      id: detail.id,
      polDetailId: detail.id,
      productCode: detail.productCode,
      productName: detail.productName,
      quantity: detail.quantity,
      color: detail.color,
      texture: detail.texture,
      material: detail.material,
      size: detail.size,
      currentStage: detail.currentStage,
    }));
    
    res.json({
      success: true,
      data: products,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_PRODUCTS_FAILED',
        message: error.message || 'Failed to fetch products for POL',
      },
    });
  }
});

// Get all defect reasons
router.get('/defect-reasons', authenticate, async (req, res) => {
  try {
    const result = await productionService.getDefectReasons();
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_DEFECT_REASONS_FAILED',
        message: error.message || 'Failed to fetch defect reasons',
      },
    });
  }
});

// Get all defect reasons (including inactive ones for management)
router.get('/defect-reasons/all', authenticate, async (req, res) => {
  try {
    const result = await productionService.getAllDefectReasons();
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_DEFECT_REASONS_FAILED',
        message: error.message || 'Failed to fetch defect reasons',
      },
    });
  }
});

// Create a new defect reason
router.post('/defect-reasons', authenticate, async (req, res) => {
  try {
    const { category, description } = req.body;
    
    if (!category || !description) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FIELDS',
          message: 'Category and description are required',
        },
      });
    }
    
    const result = await productionService.createDefectReason({
      category,
      description,
    });
    
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CREATE_DEFECT_REASON_FAILED',
        message: error.message || 'Failed to create defect reason',
      },
    });
  }
});

// Update a defect reason
router.put('/defect-reasons/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { category, description, isActive } = req.body;
    
    const result = await productionService.updateDefectReason(id, {
      category,
      description,
      isActive,
    });
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_DEFECT_REASON_FAILED',
        message: error.message || 'Failed to update defect reason',
      },
    });
  }
});

// Delete (deactivate) a defect reason
router.delete('/defect-reasons/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await productionService.deleteDefectReason(id);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'DELETE_DEFECT_REASON_FAILED',
        message: error.message || 'Failed to delete defect reason',
      },
    });
  }
});

// Get product parts for a POL detail
router.get('/product-parts/:polDetailId', authenticate, async (req, res) => {
  try {
    let { polDetailId } = req.params;
    
    // Handle invalid IDs (like NaN)
    if (polDetailId === 'NaN' || !polDetailId) {
      const referer = req.headers.referer || req.headers.referrer;
      if (referer) {
        const refererStr = Array.isArray(referer) ? referer[0] : referer;
        const match = refererStr.match(/\/product-parts\/([^/?]+)/);
        if (match && match[1] && match[1] !== 'NaN') {
          polDetailId = match[1];
        }
      }
    }
    
    if (!polDetailId || polDetailId === 'NaN') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ID',
          message: 'Invalid POL detail ID',
        },
      });
    }
    
    const result = await productionService.getProductParts(polDetailId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_PRODUCT_PARTS_FAILED',
        message: error.message || 'Failed to fetch product parts',
      },
    });
  }
});

// Create a product part
router.post('/product-parts', authenticate, async (req, res) => {
  try {
    const { polDetailId, partName, partType, throwingRequired, throwingOrder } = req.body;
    
    const result = await productionService.createProductPart({
      polDetailId,
      partName,
      partType,
      throwingRequired,
      throwingOrder,
    });
    
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CREATE_PRODUCT_PART_FAILED',
        message: error.message || 'Failed to create product part',
      },
    });
  }
});

// Update a product part
router.put('/product-parts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { partName, partType, throwingRequired, throwingOrder } = req.body;
    
    const result = await productionService.updateProductPart(id, {
      partName,
      partType,
      throwingRequired,
      throwingOrder,
    });
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_PRODUCT_PART_FAILED',
        message: error.message || 'Failed to update product part',
      },
    });
  }
});

// Delete a product part
router.delete('/product-parts/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await productionService.deleteProductPart(id);
    
    res.json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'DELETE_PRODUCT_PART_FAILED',
        message: error.message || 'Failed to delete product part',
      },
    });
  }
});

// Get stages by product type
router.get('/stages-by-product-type/:productType', authenticate, async (req, res) => {
  try {
    const { productType } = req.params;
    
    const result = productionService.getStagesByProductType(productType);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_STAGES_FAILED',
        message: error.message || 'Failed to fetch stages by product type',
      },
    });
  }
});

// Get operators (users)
router.get('/operators', authenticate, async (req, res) => {
  try {
    const result = await productionService.getOperators();
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_OPERATORS_FAILED',
        message: error.message || 'Failed to fetch operators',
      },
    });
  }
});

export default router;
