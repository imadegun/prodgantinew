import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { productionService } from '../services/production.service';

const router = Router();

// Get production stages for a product
router.get('/:polDetailId/stages', authenticate, async (req, res) => {
  try {
    const { polDetailId } = req.params;
    const detailId = parseInt(polDetailId, 10);
    
    const result = await productionService.getProductionStages(detailId);
    
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
    const { polDetailId, stage, quantity, rejectQuantity, remakeCycle, category, remakeType, ovenId, operatorId, rejectReasonId, productionDate, notes } = req.body;
    const authReq = req as any;
    
    const result = await productionService.trackProduction({
      polDetailId,
      stage,
      quantity,
      rejectQuantity: rejectQuantity || 0,
      remakeCycle: remakeCycle || 0,
      category,
      remakeType,
      ovenId,
      operatorId,
      rejectReasonId,
      productionDate: productionDate ? new Date(productionDate) : undefined,
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
    const { polDetailId } = req.params;
    const detailId = parseInt(polDetailId, 10);
    
    const result = await productionService.getDecorationTasks(detailId);
    
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
    const { polDetailId, taskName, taskDescription, quantityRequired, notes } = req.body;
    const authReq = req as any;
    
    const result = await productionService.createDecorationTask({
      polDetailId,
      taskName,
      taskDescription,
      quantityRequired,
      notes,
      createdBy: authReq.user.userId,
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
    const taskIdNum = parseInt(taskId, 10);
    const { quantityCompleted, quantityRejected, notes, status } = req.body;
    
    const result = await productionService.updateDecorationTask(taskIdNum, {
      quantityCompleted,
      quantityRejected,
      notes,
      status,
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
    const taskIdNum = parseInt(taskId, 10);
    
    const result = await productionService.deleteDecorationTask(taskIdNum);
    
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
    const authReq = req as any;
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
    const reasonId = parseInt(id, 10);
    const { category, description, isActive } = req.body;
    
    const result = await productionService.updateDefectReason(reasonId, {
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
    const reasonId = parseInt(id, 10);
    
    const result = await productionService.deleteDefectReason(reasonId);
    
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
    const { polDetailId } = req.params;
    const detailId = parseInt(polDetailId, 10);
    
    const result = await productionService.getProductParts(detailId);
    
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
    const { polDetailId, partName, partType, linkedToPartId, throwingRequired, throwingOrder } = req.body;
    
    const result = await productionService.createProductPart({
      polDetailId,
      partName,
      partType,
      linkedToPartId,
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
    const partId = parseInt(id, 10);
    const { partName, partType, linkedToPartId, throwingRequired, throwingOrder } = req.body;
    
    const result = await productionService.updateProductPart(partId, {
      partName,
      partType,
      linkedToPartId,
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
    const partId = parseInt(id, 10);
    
    const result = await productionService.deleteProductPart(partId);
    
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

// Get production stages for a specific product part
router.get('/product-parts/:partId/stages', authenticate, async (req, res) => {
  try {
    const { partId } = req.params;
    const partIdNum = parseInt(partId, 10);
    
    const result = await productionService.getPartProductionStages(partIdNum);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_PART_STAGES_FAILED',
        message: error.message || 'Failed to fetch part production stages',
      },
    });
  }
});

// Track production for a specific product part
router.post('/track-part', authenticate, async (req, res) => {
  try {
    const { polDetailId, partId, stage, quantity, rejectQuantity, remakeCycle, category, remakeType, ovenId, operatorId, rejectReasonId, productionDate, notes } = req.body;
    const authReq = req as any;
    
    const result = await productionService.trackPartProduction({
      polDetailId,
      partId,
      stage,
      quantity,
      rejectQuantity: rejectQuantity || 0,
      remakeCycle: remakeCycle || 0,
      category,
      remakeType,
      ovenId,
      operatorId,
      rejectReasonId,
      productionDate: productionDate ? new Date(productionDate) : undefined,
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
        code: error.code || 'TRACK_PART_PRODUCTION_FAILED',
        message: error.message || 'Failed to track part production',
      },
    });
  }
});

// Get remake cycles for a POL detail
router.get('/remake-cycles/:polDetailId', authenticate, async (req, res) => {
  try {
    const { polDetailId } = req.params;
    const detailId = parseInt(polDetailId, 10);
    
    const result = await productionService.getRemakeCycles(detailId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_REMAKE_CYCLES_FAILED',
        message: error.message || 'Failed to fetch remake cycles',
      },
    });
  }
});

// Create a remake cycle
router.post('/remake-cycles', authenticate, async (req, res) => {
  try {
    const { polDetailId, originalRecordId, remakeNumber, remakeType, rejectStage, rejectCategory, rejectReasonId, rejectQuantity } = req.body;
    const authReq = req as any;
    
    const result = await productionService.createRemakeCycle({
      polDetailId,
      originalRecordId,
      remakeNumber,
      remakeType,
      rejectStage,
      rejectCategory,
      rejectReasonId,
      rejectQuantity,
      createdBy: authReq.user.userId,
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
        code: error.code || 'CREATE_REMAKE_CYCLE_FAILED',
        message: error.message || 'Failed to create remake cycle',
      },
    });
  }
});

// Get stages by product type
router.get('/stages-by-product-type/:productType', authenticate, async (req, res) => {
  try {
    const { productType } = req.params;
    
    const result = productionService.getStagesByProductType(productType as any);
    
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

// Combine product parts at any stage
router.post('/combine-parts', authenticate, async (req, res) => {
  try {
    const { polDetailId, stage, parts, notes } = req.body;
    const authReq = req as any;
    
    if (!polDetailId || !stage || !parts || !Array.isArray(parts) || parts.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_REQUEST',
          message: 'polDetailId, stage, and at least 2 parts are required',
        },
      });
    }
    
    const result = await productionService.combineParts({
      polDetailId,
      stage,
      parts,
      notes,
      userId: authReq.user.userId,
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
        code: error.code || 'COMBINE_PARTS_FAILED',
        message: error.message || 'Failed to combine parts',
      },
    });
  }
});

// Get part combinations for a POL detail
router.get('/part-combinations/:polDetailId', authenticate, async (req, res) => {
  try {
    const { polDetailId } = req.params;
    const detailId = parseInt(polDetailId, 10);
    
    const result = await productionService.getPartCombinations(detailId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_PART_COMBINATIONS_FAILED',
        message: error.message || 'Failed to fetch part combinations',
      },
    });
  }
});

export default router;
