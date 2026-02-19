import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { productService } from '../services/product.service';

const router = Router();

// Get all clients from tblcollect_design
router.get('/clients', authenticate, async (req, res) => {
  try {
    const clients = await productService.getClients();
    
    res.json({
      success: true,
      data: clients,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_CLIENTS_FAILED',
        message: error.message || 'Failed to get clients',
      },
    });
  }
});

// Search products from gayafusionall
router.get('/search', authenticate, async (req, res) => {
  try {
    const { q, limit = 50, clientCode } = req.query;
    
    const result = await productService.searchProducts(
      q as string || '',
      Number(limit),
      clientCode as string || undefined
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
        code: error.code || 'SEARCH_PRODUCTS_FAILED',
        message: error.message || 'Failed to search products',
      },
    });
  }
});

// Get product by code
router.get('/:code', authenticate, async (req, res) => {
  try {
    const { code } = req.params;
    
    const product = await productService.getProductByCode(code);
    
    res.json({
      success: true,
      data: { product },
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_PRODUCT_FAILED',
        message: error.message || 'Failed to get product',
      },
    });
  }
});

// Get material requirements
router.get('/:code/materials', authenticate, async (req, res) => {
  try {
    const { code } = req.params;
    
    const materials = await productService.getMaterialRequirements(code);
    
    if (!materials) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      });
    }
    
    res.json({
      success: true,
      data: materials,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_MATERIALS_FAILED',
        message: error.message || 'Failed to get material requirements',
      },
    });
  }
});

// Get tool requirements
router.get('/:code/tools', authenticate, async (req, res) => {
  try {
    const { code } = req.params;
    
    const tools = await productService.getToolRequirements(code);
    
    if (!tools) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      });
    }
    
    res.json({
      success: true,
      data: tools,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_TOOLS_FAILED',
        message: error.message || 'Failed to get tool requirements',
      },
    });
  }
});

// Get build notes
router.get('/:code/notes', authenticate, async (req, res) => {
  try {
    const { code } = req.params;
    
    const buildNotes = await productService.getBuildNotes(code);
    
    if (buildNotes === null) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'PRODUCT_NOT_FOUND',
          message: 'Product not found',
        },
      });
    }
    
    res.json({
      success: true,
      data: {
        productCode: code,
        buildNotes,
      },
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_NOTES_FAILED',
        message: error.message || 'Failed to get build notes',
      },
    });
  }
});

export default router;
