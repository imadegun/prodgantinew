import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { polService } from '../services/pol.service';

const router = Router();

// Get all POLs
router.get('/', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, customerName, fromDate, toDate } = req.query;
    
    let filters: any = {};
    if (status) filters.status = status;
    if (customerName) filters.customerName = customerName;
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
    
    res.json({
      success: true,
      data: result,
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
    
    const result = await polService.getPOLById(id);
    
    res.json({
      success: true,
      data: result,
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
router.post('/', authenticate, authorize('MANAGER'), async (req, res) => {
  try {
    const { customerName, deliveryDate, products } = req.body;
    
    const result = await polService.createPOL({
      customerName,
      orderDate: new Date(),
      deliveryDate: new Date(deliveryDate),
      notes: ''
    });
    
    // Add products to POL
    for (const product of products) {
      await polService.addProductToPOL(result.id, product);
    }
    
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
    const { customerName, deliveryDate, status } = req.body;
    
    const updateData: any = {};
    if (customerName !== undefined) {
      updateData.customerName = customerName;
    }
    if (deliveryDate !== undefined) {
      updateData.deliveryDate = new Date(deliveryDate);
    }
    if (status !== undefined) {
      updateData.status = status;
    }
    
    const result = await polService.updatePOL(id, updateData);
    
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
    
    await polService.deletePOL(id);
    
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

export default router;
