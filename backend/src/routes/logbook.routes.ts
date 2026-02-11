import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { logbookService } from '../services/logbook.service';

const router = Router();

// Get logbook entries
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, polId, fromDate, toDate } = req.query;
    
    const filters: any = {};
    if (status) filters.status = status;
    if (polId) filters.polId = polId;
    if (fromDate) filters.startDate = new Date(fromDate as string);
    if (toDate) filters.endDate = new Date(toDate as string);
    
    const result = await logbookService.listLogEntries(
      Number(page),
      Number(limit),
      filters
    );
    
    res.json({
      success: true,
      data: result.entries,
      meta: result.pagination,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'FETCH_LOGBOOK_FAILED',
        message: error.message || 'Failed to fetch logbook entries',
      },
    });
  }
});

// Create logbook entry
router.post('/', authenticate, async (req, res) => {
  try {
    const { polId, polDetailId, stage, issueType, description, severity, resolution, status } = req.body;
    
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
    
    // Combine notes, issues, and actions into notes field
    const notes = description || '';
    const issues = issueType ? `${issueType}${severity ? ` (${severity})` : ''}` : '';
    const actions = resolution || '';
    
    const result = await logbookService.createLogEntry({
      polId,
      userId,
      entryDate: new Date(),
      status: status || 'NORMAL',
      notes,
      issues: issues || undefined,
      actions: actions || undefined,
    });
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Logbook entry created successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CREATE_LOGBOOK_FAILED',
        message: error.message || 'Failed to create logbook entry',
      },
    });
  }
});

// Update logbook entry
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, issueType, description, severity, resolution, status } = req.body;
    
    // Combine notes, issues, and actions
    const notes = description;
    const issues = issueType ? `${issueType}${severity ? ` (${severity})` : ''}` : undefined;
    const actions = resolution;
    
    const result = await logbookService.updateLogEntry(id, {
      status,
      notes,
      issues,
      actions,
    });
    
    res.json({
      success: true,
      data: result,
      message: 'Logbook entry updated successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_LOGBOOK_FAILED',
        message: error.message || 'Failed to update logbook entry',
      },
    });
  }
});

export default router;
