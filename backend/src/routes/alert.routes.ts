import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { alertService } from '../services/alert.service';

const router = Router();

// Get dashboard stats
router.get('/stats', authenticate, async (_req, res) => {
  try {
    const stats = await alertService.getAlertStatistics();
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_STATS_FAILED',
        message: error.message || 'Failed to fetch dashboard stats',
      },
    });
  }
});

// Get alerts
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, priority, polId, startDate, endDate } = req.query;
    
    const result = await alertService.listAlerts(
      Number(page),
      Number(limit),
      {
        status: status as any,
        priority: priority as any,
        polId: polId as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
      }
    );
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_ALERTS_FAILED',
        message: error.message || 'Failed to fetch alerts',
      },
    });
  }
});

// Acknowledge alert
router.put('/:id/acknowledge', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    
    const result = await alertService.acknowledgeAlert(id, userId);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'ACKNOWLEDGE_ALERT_FAILED',
        message: error.message || 'Failed to acknowledge alert',
      },
    });
  }
});

// Resolve alert
router.put('/:id/resolve', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const userId = (req as any).user.id;
    
    const result = await alertService.resolveAlert(id, userId, resolutionNotes);
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'RESOLVE_ALERT_FAILED',
        message: error.message || 'Failed to resolve alert',
      },
    });
  }
});

export default router;
