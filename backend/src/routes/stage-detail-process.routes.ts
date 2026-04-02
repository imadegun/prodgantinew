import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { stageDetailProcessService } from '../services/stage-detail-process.service';

const router = Router();

// Get all processes for a stage
router.get('/stages/:stageId/processes', authenticate, async (req, res) => {
  try {
    const { stageId } = req.params;
    const processes = await stageDetailProcessService.getProcessesByStageId(stageId);

    res.json({
      success: true,
      data: processes,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_PROCESSES_FAILED',
        message: error.message || 'Failed to get processes',
      },
    });
  }
});

// Get process by ID
router.get('/processes/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const process = await stageDetailProcessService.getProcessById(id);

    if (!process) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PROCESS_NOT_FOUND',
          message: 'Process not found',
        },
      });
    }

    res.json({
      success: true,
      data: process,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_PROCESS_FAILED',
        message: error.message || 'Failed to get process',
      },
    });
  }
});

// Create a new process for a stage
router.post('/stages/:stageId/processes', authenticate, async (req, res) => {
  try {
    const { stageId } = req.params;
    const { processName, sortOrder } = req.body;

    if (!processName) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Process name is required',
        },
      });
    }

    const process = await stageDetailProcessService.createProcess(stageId, {
      processName,
      sortOrder,
    });

    res.status(201).json({
      success: true,
      data: process,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CREATE_PROCESS_FAILED',
        message: error.message || 'Failed to create process',
      },
    });
  }
});

// Update a process
router.put('/processes/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { processName, sortOrder, isActive } = req.body;

    const process = await stageDetailProcessService.updateProcess(id, {
      processName,
      sortOrder,
      isActive,
    });

    res.json({
      success: true,
      data: process,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_PROCESS_FAILED',
        message: error.message || 'Failed to update process',
      },
    });
  }
});

// Delete a process (soft delete)
router.delete('/processes/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    await stageDetailProcessService.deleteProcess(id);

    res.json({
      success: true,
      message: 'Process deleted successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'DELETE_PROCESS_FAILED',
        message: error.message || 'Failed to delete process',
      },
    });
  }
});

// Bulk create processes for a stage
router.post('/stages/:stageId/processes/bulk', authenticate, async (req, res) => {
  try {
    const { stageId } = req.params;
    const { processes } = req.body;

    if (!Array.isArray(processes) || processes.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Processes array is required and must not be empty',
        },
      });
    }

    const createdProcesses = await stageDetailProcessService.bulkCreateProcesses(stageId, processes);

    res.status(201).json({
      success: true,
      data: createdProcesses,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'BULK_CREATE_PROCESSES_FAILED',
        message: error.message || 'Failed to bulk create processes',
      },
    });
  }
});

export default router;
