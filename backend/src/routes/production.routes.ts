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

export default router;
