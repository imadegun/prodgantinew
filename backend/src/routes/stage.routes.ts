import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { stageService } from '../services/stage.service';

const router = Router();

// Get all categories with their stages
router.get('/categories', authenticate, async (req, res) => {
  try {
    const categories = await stageService.getCategoriesWithStages();
    
    res.json({
      success: true,
      data: categories,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_CATEGORIES_FAILED',
        message: error.message || 'Failed to get categories',
      },
    });
  }
});

// Get category by ID
router.get('/categories/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await stageService.getCategoryById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found',
        },
      });
    }
    
    res.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_CATEGORY_FAILED',
        message: error.message || 'Failed to get category',
      },
    });
  }
});

// Create a new category
router.post('/categories', authenticate, async (req, res) => {
  try {
    const { code, name, color, sortOrder } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Code and name are required',
        },
      });
    }
    
    const category = await stageService.createCategory({
      code,
      name,
      color,
      sortOrder,
    });
    
    res.status(201).json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CREATE_CATEGORY_FAILED',
        message: error.message || 'Failed to create category',
      },
    });
  }
});

// Update a category
router.put('/categories/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, sortOrder, isActive } = req.body;
    
    const category = await stageService.updateCategory(id, {
      name,
      color,
      sortOrder,
      isActive,
    });
    
    res.json({
      success: true,
      data: category,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_CATEGORY_FAILED',
        message: error.message || 'Failed to update category',
      },
    });
  }
});

// Delete a category (soft delete)
router.delete('/categories/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await stageService.deleteCategory(id);
    
    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'DELETE_CATEGORY_FAILED',
        message: error.message || 'Failed to delete category',
      },
    });
  }
});

// Get stage mapping (code -> name) - MUST come before /:id route
router.get('/mapping/stages', authenticate, async (req, res) => {
  try {
    const mapping = await stageService.getStageMapping();
    
    res.json({
      success: true,
      data: mapping,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_STAGE_MAPPING_FAILED',
        message: error.message || 'Failed to get stage mapping',
      },
    });
  }
});

// Get category mapping (code -> { name, color }) - MUST come before /:id route
router.get('/mapping/categories', authenticate, async (req, res) => {
  try {
    const mapping = await stageService.getCategoryMapping();
    
    res.json({
      success: true,
      data: mapping,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_CATEGORY_MAPPING_FAILED',
        message: error.message || 'Failed to get category mapping',
      },
    });
  }
});

// Get all stages (with optional includeInactive filter for management page)
router.get('/', authenticate, async (req, res) => {
  try {
    // Default to include inactive stages for management page
    // Use ?includeInactive=false to get only active stages
    const includeInactive = req.query.includeInactive !== 'false';
    const stages = await stageService.getAllStages(includeInactive);
    
    res.json({
      success: true,
      data: stages,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_STAGES_FAILED',
        message: error.message || 'Failed to get stages',
      },
    });
  }
});

// Get stages by category ID
router.get('/by-category/:categoryId', authenticate, async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const stages = await stageService.getStagesByCategory(categoryId);
    
    res.json({
      success: true,
      data: stages,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_STAGES_BY_CATEGORY_FAILED',
        message: error.message || 'Failed to get stages by category',
      },
    });
  }
});

// Get stage by ID - MUST come after /mapping/* routes
router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    const stage = await stageService.getStageById(id);
    
    if (!stage) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'STAGE_NOT_FOUND',
          message: 'Stage not found',
        },
      });
    }
    
    res.json({
      success: true,
      data: stage,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'GET_STAGE_FAILED',
        message: error.message || 'Failed to get stage',
      },
    });
  }
});

// Create a new stage
router.post('/', authenticate, async (req, res) => {
  try {
    const { code, name, categoryId, sortOrder, requiresOven, hasDetailProcess, description } = req.body;
    
    if (!code || !name || !categoryId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Code, name, and categoryId are required',
        },
      });
    }
    
    const stage = await stageService.createStage({
      code,
      name,
      categoryId,
      sortOrder,
      requiresOven,
      hasDetailProcess,
      description,
    });
    
    res.status(201).json({
      success: true,
      data: stage,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'CREATE_STAGE_FAILED',
        message: error.message || 'Failed to create stage',
      },
    });
  }
});

// Update a stage
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, categoryId, sortOrder, isActive, requiresOven, hasDetailProcess, description } = req.body;
    
    const stage = await stageService.updateStage(id, {
      name,
      categoryId,
      sortOrder,
      isActive,
      requiresOven,
      hasDetailProcess,
      description,
    });
    
    res.json({
      success: true,
      data: stage,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'UPDATE_STAGE_FAILED',
        message: error.message || 'Failed to update stage',
      },
    });
  }
});

// Delete a stage (soft delete)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    
    await stageService.deleteStage(id);
    
    res.json({
      success: true,
      message: 'Stage deleted successfully',
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({
      success: false,
      error: {
        code: error.code || 'DELETE_STAGE_FAILED',
        message: error.message || 'Failed to delete stage',
      },
    });
  }
});

export default router;
