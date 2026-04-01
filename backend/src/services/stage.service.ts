import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/error.middleware';

const prisma = new PrismaClient();

export interface StageCategory {
  id: number;
  code: string;
  name: string;
  color: string;
  sortOrder: number;
  isActive: boolean;
  stages: ProductionStageConfig[];
}

export interface ProductionStageConfig {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  sortOrder: number;
  isActive: boolean;
  requiresOven: boolean;
  description: string | null;
  category?: {
    id: number;
    code: string;
    name: string;
    color: string;
  };
}

export interface CreateCategoryDTO {
  code: string;
  name: string;
  color?: string;
  sortOrder?: number;
}

export interface UpdateCategoryDTO {
  name?: string;
  color?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CreateStageDTO {
  code: string;
  name: string;
  categoryId: number;
  sortOrder?: number;
  requiresOven?: boolean;
  description?: string;
}

export interface UpdateStageDTO {
  name?: string;
  categoryId?: number;
  sortOrder?: number;
  isActive?: boolean;
  requiresOven?: boolean;
  description?: string;
}

export class StageService {
  /**
   * Get all active categories with their stages
   */
  async getCategoriesWithStages(): Promise<StageCategory[]> {
    try {
      const categories = await prisma.stageCategory.findMany({
        where: { isActive: true },
        include: {
          stages: {
            where: { isActive: true },
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      return categories;
    } catch (error: any) {
      console.error('Error getting categories with stages:', error);
      throw new AppError('Failed to get categories with stages', 500, 'STAGE_CATEGORIES_ERROR');
    }
  }

  /**
   * Get all categories (including inactive)
   */
  async getAllCategories(): Promise<StageCategory[]> {
    try {
      const categories = await prisma.stageCategory.findMany({
        include: {
          stages: {
            orderBy: { sortOrder: 'asc' },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      return categories;
    } catch (error: any) {
      console.error('Error getting all categories:', error);
      throw new AppError('Failed to get all categories', 500, 'STAGE_CATEGORIES_ERROR');
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: number): Promise<StageCategory | null> {
    try {
      const category = await prisma.stageCategory.findUnique({
        where: { id },
        include: {
          stages: {
            orderBy: { sortOrder: 'asc' },
          },
        },
      });

      return category;
    } catch (error: any) {
      console.error('Error getting category by ID:', error);
      throw new AppError('Failed to get category', 500, 'STAGE_CATEGORY_ERROR');
    }
  }

  /**
   * Create a new category
   */
  async createCategory(data: CreateCategoryDTO): Promise<StageCategory> {
    try {
      const category = await prisma.stageCategory.create({
        data: {
          code: data.code.toUpperCase(),
          name: data.name,
          color: data.color || '#4caf50',
          sortOrder: data.sortOrder || 0,
        },
        include: {
          stages: true,
        },
      });

      return category;
    } catch (error: any) {
      console.error('Error creating category:', error);
      if (error.code === 'P2002') {
        throw new AppError('Category code already exists', 400, 'CATEGORY_CODE_EXISTS');
      }
      throw new AppError('Failed to create category', 500, 'CATEGORY_CREATE_ERROR');
    }
  }

  /**
   * Update a category
   */
  async updateCategory(id: number, data: UpdateCategoryDTO): Promise<StageCategory> {
    try {
      const category = await prisma.stageCategory.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          stages: true,
        },
      });

      return category;
    } catch (error: any) {
      console.error('Error updating category:', error);
      if (error.code === 'P2025') {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
      throw new AppError('Failed to update category', 500, 'CATEGORY_UPDATE_ERROR');
    }
  }

  /**
   * Delete a category (soft delete by setting isActive to false)
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      await prisma.stageCategory.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      if (error.code === 'P2025') {
        throw new AppError('Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
      throw new AppError('Failed to delete category', 500, 'CATEGORY_DELETE_ERROR');
    }
  }

  /**
   * Get all active stages
   */
  async getAllStages(): Promise<ProductionStageConfig[]> {
    try {
      const stages = await prisma.productionStageConfig.findMany({
        where: { isActive: true },
        include: {
          category: {
            select: {
              id: true,
              code: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: [{ category: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
      });

      return stages;
    } catch (error: any) {
      console.error('Error getting all stages:', error);
      throw new AppError('Failed to get all stages', 500, 'STAGES_ERROR');
    }
  }

  /**
   * Get stages by category ID
   */
  async getStagesByCategory(categoryId: number): Promise<ProductionStageConfig[]> {
    try {
      const stages = await prisma.productionStageConfig.findMany({
        where: {
          categoryId,
          isActive: true,
        },
        include: {
          category: {
            select: {
              id: true,
              code: true,
              name: true,
              color: true,
            },
          },
        },
        orderBy: { sortOrder: 'asc' },
      });

      return stages;
    } catch (error: any) {
      console.error('Error getting stages by category:', error);
      throw new AppError('Failed to get stages by category', 500, 'STAGES_BY_CATEGORY_ERROR');
    }
  }

  /**
   * Get stage by ID
   */
  async getStageById(id: number): Promise<ProductionStageConfig | null> {
    try {
      const stage = await prisma.productionStageConfig.findUnique({
        where: { id },
        include: {
          category: {
            select: {
              id: true,
              code: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return stage;
    } catch (error: any) {
      console.error('Error getting stage by ID:', error);
      throw new AppError('Failed to get stage', 500, 'STAGE_ERROR');
    }
  }

  /**
   * Create a new stage
   */
  async createStage(data: CreateStageDTO): Promise<ProductionStageConfig> {
    try {
      const stage = await prisma.productionStageConfig.create({
        data: {
          code: data.code.toUpperCase(),
          name: data.name,
          categoryId: data.categoryId,
          sortOrder: data.sortOrder || 0,
          requiresOven: data.requiresOven || false,
          description: data.description,
        },
        include: {
          category: {
            select: {
              id: true,
              code: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return stage;
    } catch (error: any) {
      console.error('Error creating stage:', error);
      if (error.code === 'P2002') {
        throw new AppError('Stage code already exists', 400, 'STAGE_CODE_EXISTS');
      }
      if (error.code === 'P2003') {
        throw new AppError('Category not found', 400, 'CATEGORY_NOT_FOUND');
      }
      throw new AppError('Failed to create stage', 500, 'STAGE_CREATE_ERROR');
    }
  }

  /**
   * Update a stage
   */
  async updateStage(id: number, data: UpdateStageDTO): Promise<ProductionStageConfig> {
    try {
      const stage = await prisma.productionStageConfig.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          category: {
            select: {
              id: true,
              code: true,
              name: true,
              color: true,
            },
          },
        },
      });

      return stage;
    } catch (error: any) {
      console.error('Error updating stage:', error);
      if (error.code === 'P2025') {
        throw new AppError('Stage not found', 404, 'STAGE_NOT_FOUND');
      }
      throw new AppError('Failed to update stage', 500, 'STAGE_UPDATE_ERROR');
    }
  }

  /**
   * Delete a stage (soft delete by setting isActive to false)
   */
  async deleteStage(id: number): Promise<void> {
    try {
      await prisma.productionStageConfig.update({
        where: { id },
        data: {
          isActive: false,
          updatedAt: new Date(),
        },
      });
    } catch (error: any) {
      console.error('Error deleting stage:', error);
      if (error.code === 'P2025') {
        throw new AppError('Stage not found', 404, 'STAGE_NOT_FOUND');
      }
      throw new AppError('Failed to delete stage', 500, 'STAGE_DELETE_ERROR');
    }
  }

  /**
   * Get stage mapping for frontend (code -> name)
   */
  async getStageMapping(): Promise<Record<string, string>> {
    try {
      const stages = await prisma.productionStageConfig.findMany({
        where: { isActive: true },
        select: { code: true, name: true },
      });

      const mapping: Record<string, string> = {};
      stages.forEach((stage) => {
        mapping[stage.code] = stage.name;
      });

      return mapping;
    } catch (error: any) {
      console.error('Error getting stage mapping:', error);
      throw new AppError('Failed to get stage mapping', 500, 'STAGE_MAPPING_ERROR');
    }
  }

  /**
   * Get category mapping for frontend (code -> { name, color })
   */
  async getCategoryMapping(): Promise<Record<string, { name: string; color: string }>> {
    try {
      const categories = await prisma.stageCategory.findMany({
        where: { isActive: true },
        select: { code: true, name: true, color: true },
      });

      const mapping: Record<string, { name: string; color: string }> = {};
      categories.forEach((category) => {
        mapping[category.code] = { name: category.name, color: category.color };
      });

      return mapping;
    } catch (error: any) {
      console.error('Error getting category mapping:', error);
      throw new AppError('Failed to get category mapping', 500, 'CATEGORY_MAPPING_ERROR');
    }
  }
}

export const stageService = new StageService();
