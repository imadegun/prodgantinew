import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { revisionService } from '../services/revision.service';

const router = Router();

// Get revision tickets
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, polId } = req.query;
    
    const filters: any = {};
    if (status && status !== 'all') filters.status = status;
    if (type && type !== 'all') filters.type = type;
    if (polId) filters.polId = polId;
    
    const result = await revisionService.listRevisions(
      Number(page),
      Number(limit),
      filters
    );
    
    res.json({
      success: true,
      data: {
        tickets: result.revisions,
      },
      meta: result.pagination,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_REVISIONS_FAILED',
        message: error.message || 'Failed to fetch revision tickets',
      },
    });
  }
});

// Create revision ticket
router.post('/', authenticate, async (req, res) => {
  try {
    const { polId, polDetailId, type, issueType, severity, description, proposedSolution } = req.body;
    
    // Get user ID from auth middleware
    const authReq = req as any;
    const userId = authReq.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }
    
    const result = await revisionService.createRevision({
      polId,
      polDetailId,
      userId,
      type: type || 'OTHER',
      issueType: issueType || '',
      severity: severity || 'MEDIUM',
      description: description || '',
      proposedSolution,
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Revision ticket created successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CREATE_REVISION_FAILED',
        message: error.message || 'Failed to create revision ticket',
      },
    });
  }
});

// Submit revision for approval
router.post('/:id/submit', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await revisionService.submitRevision(id);
    
    res.json({
      success: true,
      data: result,
      message: 'Revision ticket submitted for approval',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'SUBMIT_REVISION_FAILED',
        message: error.message || 'Failed to submit revision ticket',
      },
    });
  }
});

// Approve revision
router.post('/:id/approve', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get user ID from auth middleware
    const authReq = req as any;
    const userId = authReq.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }
    
    const result = await revisionService.approveRevision(id, userId, true);
    
    res.json({
      success: true,
      data: result,
      message: 'Revision ticket approved',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'APPROVE_REVISION_FAILED',
        message: error.message || 'Failed to approve revision ticket',
      },
    });
  }
});

// Reject revision
router.post('/:id/reject', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Get user ID from auth middleware
    const authReq = req as any;
    const userId = authReq.user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not authenticated',
        },
      });
    }
    
    const result = await revisionService.approveRevision(id, userId, false, reason);
    
    res.json({
      success: true,
      data: result,
      message: 'Revision ticket rejected',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'REJECT_REVISION_FAILED',
        message: error.message || 'Failed to reject revision ticket',
      },
    });
  }
});

export default router;
