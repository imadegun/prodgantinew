# Dynamic Stage Management Implementation Plan

## Overview
This document outlines the implementation of a database-driven stage management system that allows adding/modifying stages and categories without code changes.

## Current State
- Stages are hardcoded in `ProductionStage` enum
- Categories are hardcoded in `ProductCategory` enum
- Frontend has hardcoded stage names mapping

## Target State
- Stages and categories stored in database tables
- Admin UI for managing stages/categories
- Frontend fetches stages dynamically from API
- Backward compatibility with existing data

---

## 1. Database Schema Changes

### 1.1 New Tables

```prisma
// Stage Categories table - manages FORMING, DECOR, DRYING, etc.
model StageCategory {
  id          Int      @id @default(autoincrement())
  code        String   @unique // e.g., "FORMING", "DECOR", "DRYING"
  name        String   // Display name: "Forming", "Decoration", "Drying"
  color       String   @default("#4caf50") // Hex color for UI
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  stages      ProductionStageConfig[]
  
  @@map("stage_categories")
}

// Production Stages Configuration table
model ProductionStageConfig {
  id              Int      @id @default(autoincrement())
  code            String   @unique // e.g., "THROWING", "TRIMMING"
  name            String   // Display name: "Throwing", "Trimming"
  categoryId      Int      // FK to StageCategory
  sortOrder       Int      @default(0)
  isActive        Boolean  @default(true)
  requiresOven    Boolean  @default(false) // For firing stages
  description     String?  // Optional description
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  // Relationships
  category        StageCategory @relation(fields: [categoryId], references: [id])
  
  @@map("production_stage_configs")
}
```

### 1.2 Migration Strategy

**Option A: Keep existing enums for backward compatibility**
- Keep `ProductionStage` and `ProductCategory` enums
- Add new tables for configuration
- Map existing enum values to new table records
- Gradually migrate to use new tables

**Option B: Remove enums and use only tables** (Recommended for new projects)
- Drop `ProductionStage` and `ProductCategory` enums
- Use string fields with foreign keys to new tables
- Requires data migration

**Recommended: Option A** - Safer for existing data

---

## 2. Backend Implementation

### 2.1 API Endpoints

```
GET    /api/stages/categories          - List all categories
POST   /api/stages/categories          - Create category
PUT    /api/stages/categories/:id      - Update category
DELETE /api/stages/categories/:id      - Delete category (soft delete)

GET    /api/stages                     - List all stages
POST   /api/stages                     - Create stage
PUT    /api/stages/:id                 - Update stage
DELETE /api/stages/:id                 - Delete stage (soft delete)
GET    /api/stages/by-category/:categoryId - Get stages by category
```

### 2.2 Service Layer

```typescript
// backend/src/services/stage.service.ts

export class StageService {
  // Get all active categories with their stages
  async getCategoriesWithStages() {
    return prisma.stageCategory.findMany({
      where: { isActive: true },
      include: {
        stages: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' }
        }
      },
      orderBy: { sortOrder: 'asc' }
    });
  }

  // Create new category
  async createCategory(data: CreateCategoryDTO) {
    return prisma.stageCategory.create({ data });
  }

  // Create new stage
  async createStage(data: CreateStageDTO) {
    return prisma.productionStageConfig.create({
      data,
      include: { category: true }
    });
  }

  // Update stage
  async updateStage(id: number, data: UpdateStageDTO) {
    return prisma.productionStageConfig.update({
      where: { id },
      data,
      include: { category: true }
    });
  }

  // Get stage mapping for frontend (code -> name)
  async getStageMapping() {
    const stages = await prisma.productionStageConfig.findMany({
      where: { isActive: true },
      select: { code: true, name: true }
    });
    
    return stages.reduce((acc, stage) => {
      acc[stage.code] = stage.name;
      return acc;
    }, {} as Record<string, string>);
  }

  // Get category mapping for frontend
  async getCategoryMapping() {
    const categories = await prisma.stageCategory.findMany({
      where: { isActive: true },
      select: { code: true, name: true, color: true }
    });
    
    return categories.reduce((acc, cat) => {
      acc[cat.code] = { name: cat.name, color: cat.color };
      return acc;
    }, {} as Record<string, { name: string; color: string }>);
  }
}
```

### 2.3 Controller

```typescript
// backend/src/controllers/stage.controller.ts

export class StageController {
  async getCategoriesWithStages(req: Request, res: Response) {
    const categories = await stageService.getCategoriesWithStages();
    res.json(categories);
  }

  async createCategory(req: Request, res: Response) {
    const category = await stageService.createCategory(req.body);
    res.status(201).json(category);
  }

  async createStage(req: Request, res: Response) {
    const stage = await stageService.createStage(req.body);
    res.status(201).json(stage);
  }

  async getStageMapping(req: Request, res: Response) {
    const mapping = await stageService.getStageMapping();
    res.json(mapping);
  }

  async getCategoryMapping(req: Request, res: Response) {
    const mapping = await stageService.getCategoryMapping();
    res.json(mapping);
  }
}
```

---

## 3. Frontend Implementation

### 3.1 API Service

```typescript
// frontend/src/services/stage.service.ts

export const stageService = {
  async getCategoriesWithStages(): Promise<CategoryWithStages[]> {
    const response = await api.get('/stages/categories');
    return response.data;
  },

  async getStageMapping(): Promise<Record<string, string>> {
    const response = await api.get('/stages/mapping');
    return response.data;
  },

  async getCategoryMapping(): Promise<Record<string, CategoryInfo>> {
    const response = await api.get('/stages/categories/mapping');
    return response.data;
  },

  async createCategory(data: CreateCategoryDTO): Promise<StageCategory> {
    const response = await api.post('/stages/categories', data);
    return response.data;
  },

  async createStage(data: CreateStageDTO): Promise<ProductionStageConfig> {
    const response = await api.post('/stages', data);
    return response.data;
  },

  async updateStage(id: number, data: UpdateStageDTO): Promise<ProductionStageConfig> {
    const response = await api.put(`/stages/${id}`, data);
    return response.data;
  }
};
```

### 3.2 Updated ProductionTracking Component

```typescript
// frontend/src/pages/ProductionTracking.tsx

import { useState, useEffect } from 'react';
import { stageService } from '../services/stage.service';

// Replace hardcoded mappings with dynamic ones
const [stageNames, setStageNames] = useState<Record<string, string>>({});
const [categoryColors, setCategoryColors] = useState<Record<string, string>>({});
const [categoryLabels, setCategoryLabels] = useState<Record<string, string>>({});
const [categories, setCategories] = useState<CategoryWithStages[]>([]);

useEffect(() => {
  loadStageData();
}, []);

const loadStageData = async () => {
  try {
    // Load categories with stages
    const categoriesData = await stageService.getCategoriesWithStages();
    setCategories(categoriesData);

    // Build mappings
    const stageMapping: Record<string, string> = {};
    const colorMapping: Record<string, string> = {};
    const labelMapping: Record<string, string> = {};

    categoriesData.forEach(category => {
      colorMapping[category.code] = category.color;
      labelMapping[category.code] = category.name;
      
      category.stages.forEach(stage => {
        stageMapping[stage.code] = stage.name;
      });
    });

    setStageNames(stageMapping);
    setCategoryColors(colorMapping);
    setCategoryLabels(labelMapping);
  } catch (error) {
    console.error('Error loading stage data:', error);
  }
};
```

### 3.3 Admin UI for Stage Management

Create a new page `StageManagement.tsx`:

```typescript
// frontend/src/pages/StageManagement.tsx

import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, TextField,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton,
  Chip, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import { stageService } from '../services/stage.service';

const StageManagement = () => {
  const [categories, setCategories] = useState<CategoryWithStages[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [dialogType, setDialogType] = useState<'category' | 'stage'>('category');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await stageService.getCategoriesWithStages();
    setCategories(data);
  };

  const handleSave = async (data: any) => {
    if (dialogType === 'category') {
      if (editingItem) {
        await stageService.updateCategory(editingItem.id, data);
      } else {
        await stageService.createCategory(data);
      }
    } else {
      if (editingItem) {
        await stageService.updateStage(editingItem.id, data);
      } else {
        await stageService.createStage(data);
      }
    }
    setDialogOpen(false);
    loadData();
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Stage Management</Typography>
      
      {/* Categories Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Categories</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => { setDialogType('category'); setEditingItem(null); setDialogOpen(true); }}
            >
              Add Category
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Color</TableCell>
                  <TableCell>Sort Order</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell><Chip label={cat.code} size="small" /></TableCell>
                    <TableCell>{cat.name}</TableCell>
                    <TableCell>
                      <Box sx={{ width: 24, height: 24, bgcolor: cat.color, borderRadius: 1 }} />
                    </TableCell>
                    <TableCell>{cat.sortOrder}</TableCell>
                    <TableCell>
                      <Chip label={cat.isActive ? 'Active' : 'Inactive'} 
                            color={cat.isActive ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => { setDialogType('category'); setEditingItem(cat); setDialogOpen(true); }}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Stages Section */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Stages</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => { setDialogType('stage'); setEditingItem(null); setDialogOpen(true); }}
            >
              Add Stage
            </Button>
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Code</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Sort Order</TableCell>
                  <TableCell>Requires Oven</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.flatMap(cat => cat.stages).map((stage) => (
                  <TableRow key={stage.id}>
                    <TableCell><Chip label={stage.code} size="small" /></TableCell>
                    <TableCell>{stage.name}</TableCell>
                    <TableCell>
                      <Chip label={stage.category.name} size="small" 
                            sx={{ bgcolor: stage.category.color, color: 'white' }} />
                    </TableCell>
                    <TableCell>{stage.sortOrder}</TableCell>
                    <TableCell>{stage.requiresOven ? 'Yes' : 'No'}</TableCell>
                    <TableCell>
                      <Chip label={stage.isActive ? 'Active' : 'Inactive'} 
                            color={stage.isActive ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>
                      <IconButton onClick={() => { setDialogType('stage'); setEditingItem(stage); setDialogOpen(true); }}>
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <StageDialog
        open={dialogOpen}
        type={dialogType}
        item={editingItem}
        categories={categories}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />
    </Box>
  );
};

export default StageManagement;
```

---

## 4. Data Migration

### 4.1 Seed Script

```typescript
// backend/prisma/seed-stages.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedStages() {
  console.log('Seeding stage categories and stages...');

  // Create categories
  const categories = [
    { code: 'FORMING', name: 'Forming', color: '#4caf50', sortOrder: 1 },
    { code: 'DECOR', name: 'Decoration', color: '#ff9800', sortOrder: 2 },
    { code: 'DRYING', name: 'Drying', color: '#9c27b0', sortOrder: 3 },
    { code: 'FIRING', name: 'Firing', color: '#f44336', sortOrder: 4 },
    { code: 'GLAZING', name: 'Glazing', color: '#2196f3', sortOrder: 5 },
    { code: 'QC', name: 'Quality Control', color: '#607d8b', sortOrder: 6 },
  ];

  for (const cat of categories) {
    await prisma.stageCategory.upsert({
      where: { code: cat.code },
      update: cat,
      create: cat,
    });
  }

  // Create stages
  const stages = [
    // Forming
    { code: 'THROWING', name: 'Throwing', categoryCode: 'FORMING', sortOrder: 1 },
    { code: 'TRIMMING', name: 'Trimming', categoryCode: 'FORMING', sortOrder: 2 },
    { code: 'DECORATION', name: 'Decoration', categoryCode: 'FORMING', sortOrder: 3 },
    
    // Drying
    { code: 'DRYING', name: 'Drying', categoryCode: 'DRYING', sortOrder: 1 },
    
    // Firing
    { code: 'LOAD_BISQUE', name: 'Load Bisque', categoryCode: 'FIRING', sortOrder: 1, requiresOven: true },
    { code: 'OUT_BISQUE', name: 'Out Bisque', categoryCode: 'FIRING', sortOrder: 2, requiresOven: true },
    { code: 'LOAD_HIGH_FIRING', name: 'Load High Firing', categoryCode: 'FIRING', sortOrder: 3, requiresOven: true },
    { code: 'OUT_HIGH_FIRING', name: 'Out High Firing', categoryCode: 'FIRING', sortOrder: 4, requiresOven: true },
    { code: 'LOAD_RAKU_FIRING', name: 'Load Raku Firing', categoryCode: 'FIRING', sortOrder: 5, requiresOven: true },
    { code: 'OUT_RAKU_FIRING', name: 'Out Raku Firing', categoryCode: 'FIRING', sortOrder: 6, requiresOven: true },
    { code: 'LOAD_LUSTER_FIRING', name: 'Load Luster Firing', categoryCode: 'FIRING', sortOrder: 7, requiresOven: true },
    { code: 'OUT_LUSTER_FIRING', name: 'Out Luster Firing', categoryCode: 'FIRING', sortOrder: 8, requiresOven: true },
    
    // Glazing
    { code: 'SANDING', name: 'Sanding', categoryCode: 'GLAZING', sortOrder: 1 },
    { code: 'WAXING', name: 'Waxing', categoryCode: 'GLAZING', sortOrder: 2 },
    { code: 'DIPPING', name: 'Dipping', categoryCode: 'GLAZING', sortOrder: 3 },
    { code: 'SPRAYING', name: 'Spraying', categoryCode: 'GLAZING', sortOrder: 4 },
    { code: 'COLOR_DECORATION', name: 'Color Decoration', categoryCode: 'GLAZING', sortOrder: 5 },
    
    // QC
    { code: 'QC_GOOD', name: 'Good', categoryCode: 'QC', sortOrder: 1 },
    { code: 'QC_REJECT', name: 'Reject', categoryCode: 'QC', sortOrder: 2 },
    { code: 'QC_RE_FIRING', name: 'Re-Firing', categoryCode: 'QC', sortOrder: 3 },
    { code: 'QC_SECOND', name: 'Second', categoryCode: 'QC', sortOrder: 4 },
  ];

  for (const stage of stages) {
    const category = await prisma.stageCategory.findUnique({
      where: { code: stage.categoryCode }
    });

    if (category) {
      await prisma.productionStageConfig.upsert({
        where: { code: stage.code },
        update: {
          name: stage.name,
          categoryId: category.id,
          sortOrder: stage.sortOrder,
          requiresOven: stage.requiresOven || false,
        },
        create: {
          code: stage.code,
          name: stage.name,
          categoryId: category.id,
          sortOrder: stage.sortOrder,
          requiresOven: stage.requiresOven || false,
        },
      });
    }
  }

  console.log('Stage seeding completed!');
}

seedStages()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

---

## 5. Implementation Steps

### Phase 1: Database Setup
1. Add new tables to Prisma schema
2. Run migration: `npx prisma migrate dev --name add_stage_management`
3. Run seed script: `npx ts-node prisma/seed-stages.ts`

### Phase 2: Backend API
1. Create stage service
2. Create stage controller
3. Add routes
4. Test API endpoints

### Phase 3: Frontend Integration
1. Create stage service
2. Update ProductionTracking to use dynamic stages
3. Create StageManagement admin page
4. Add route to admin page

### Phase 4: Testing & Deployment
1. Test all CRUD operations
2. Verify existing production records still work
3. Deploy to production

---

## 6. Benefits

✅ **Dynamic Stage Management** - Add/modify stages without code changes
✅ **Admin UI** - Non-technical users can manage stages
✅ **Backward Compatible** - Existing data continues to work
✅ **Scalable** - Easy to add new stages/categories
✅ **Maintainable** - Single source of truth for stage data

---

## 7. Future Enhancements

- Stage validation rules (which stages can follow which)
- Stage-specific fields (custom fields per stage)
- Stage permissions (which roles can access which stages)
- Stage history tracking (who changed what when)
- Import/export stage configurations
