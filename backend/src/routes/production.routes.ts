import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { productionService } from '../services/production.service';

const router = Router();

// Get production stages for a product
router.get('/:polDetailId/stages', authenticate, async (req, res) => {
  try {
    const { polDetailId } = req.params;
    
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
    const { polDetailId, stage, quantity, rejectQuantity, remakeCycle, notes } = req.body;
    const authReq = req as any;
    
    const result = await productionService.trackProduction({
      polDetailId,
      stage,
      quantity,
      rejectQuantity: rejectQuantity || 0,
      remakeCycle: remakeCycle || 0,
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

export default router;
