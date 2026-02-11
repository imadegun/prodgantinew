import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { reportService } from '../services/report.service';

const router = Router();

// POL Summary Report
router.get('/pol-summary', authenticate, async (req, res) => {
  try {
    const { fromDate, toDate, polId, status, format = 'JSON' } = req.query;
    
    const result = await reportService.getPOLSummary({
      fromDate: fromDate as string,
      toDate: toDate as string,
      polId: polId as string,
      status: status as string,
      format: format as string,
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
        code: error.code || 'GENERATE_REPORT_FAILED',
        message: error.message || 'Failed to generate report',
      },
    });
  }
});

// Forming Analysis Report
router.get('/forming-analysis', authenticate, async (req, res) => {
  try {
    const { fromDate, toDate, polId, format = 'JSON' } = req.query;
    
    const result = await reportService.getFormingAnalysis({
      fromDate: fromDate as string,
      toDate: toDate as string,
      polId: polId as string,
      format: format as string,
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
        code: error.code || 'GENERATE_REPORT_FAILED',
        message: error.message || 'Failed to generate report',
      },
    });
  }
});

// QC Analysis Report
router.get('/qc-analysis', authenticate, async (req, res) => {
  try {
    const { fromDate, toDate, format = 'JSON' } = req.query;
    
    const result = await reportService.getQCAnalysis({
      fromDate: fromDate as string,
      toDate: toDate as string,
      format: format as string,
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
        code: error.code || 'GENERATE_REPORT_FAILED',
        message: error.message || 'Failed to generate report',
      },
    });
  }
});

// Production Progress Report
router.get('/production-progress', authenticate, async (req, res) => {
  try {
    const { polId, includeAlerts } = req.query;
    
    const result = await reportService.getProductionProgress({
      polId: polId as string,
      includeAlerts: includeAlerts === 'true',
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
        code: error.code || 'GENERATE_REPORT_FAILED',
        message: error.message || 'Failed to generate report',
      },
    });
  }
});

export default router;
