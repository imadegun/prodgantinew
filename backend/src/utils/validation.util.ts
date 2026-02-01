import { z } from 'zod';

// Auth validation schemas
export const loginSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  role: z.enum(['MANAGER', 'ADMIN', 'WORKER']),
});

// POL validation schemas
export const createPOLSchema = z.object({
  polNumber: z.string().min(1, 'POL number is required'),
  customerName: z.string().min(1, 'Customer name is required'),
  orderDate: z.coerce.date(),
  deliveryDate: z.coerce.date(),
  notes: z.string().optional(),
});

export const updatePOLSchema = z.object({
  customerName: z.string().optional(),
  deliveryDate: z.coerce.date().optional(),
  notes: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
});

export const addProductToPOLSchema = z.object({
  productCode: z.string().min(1, 'Product code is required'),
  productName: z.string().min(1, 'Product name is required'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  productType: z.enum(['PLAIN', 'DECOR', 'HAND_BUILT', 'SLAB_TRAY']).optional(),
  color: z.string().optional(),
  texture: z.string().optional(),
  material: z.string().optional(),
  size: z.string().optional(),
  finalSize: z.string().optional(),
  notes: z.string().optional(),
});

// Production validation schemas
export const trackProductionSchema = z.object({
  polDetailId: z.string().min(1, 'POL detail ID is required'),
  stage: z.enum(['FORMING', 'FIRING', 'GLAZING', 'QUALITY_CONTROL', 'PACKAGING']),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  notes: z.string().optional(),
});

// Alert validation schemas
export const acknowledgeAlertSchema = z.object({});

export const resolveAlertSchema = z.object({
  resolutionNotes: z.string().optional(),
});

// Logbook validation schemas
export const createLogEntrySchema = z.object({
  polId: z.string().optional(),
  entryDate: z.coerce.date(),
  status: z.enum(['NORMAL', 'ISSUES', 'RESOLVED']),
  notes: z.string().min(1, 'Notes are required'),
  issues: z.string().optional(),
  actions: z.string().optional(),
});

export const updateLogEntrySchema = z.object({
  entryDate: z.coerce.date().optional(),
  status: z.enum(['NORMAL', 'ISSUES', 'RESOLVED']).optional(),
  notes: z.string().optional(),
  issues: z.string().optional(),
  actions: z.string().optional(),
});

// Revision validation schemas
export const createRevisionSchema = z.object({
  polId: z.string().min(1, 'POL ID is required'),
  polDetailId: z.string().optional(),
  type: z.enum(['DESIGN', 'PRODUCTION', 'MATERIAL', 'OTHER']),
  issueType: z.string().min(1, 'Issue type is required'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  description: z.string().min(1, 'Description is required'),
  proposedSolution: z.string().optional(),
});

export const updateRevisionSchema = z.object({
  description: z.string().optional(),
  proposedSolution: z.string().optional(),
  managerNotes: z.string().optional(),
});

export const approveRevisionSchema = z.object({
  approved: z.boolean(),
  managerNotes: z.string().optional(),
});

// Report validation schemas
export const reportFiltersSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  polId: z.string().optional(),
  productCode: z.string().optional(),
});

// Product validation schemas
export const searchProductsSchema = z.object({
  q: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

// Pagination validation
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
});

// Helper function to validate request body
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    throw {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors,
    };
  }
  
  return result.data;
}

// Helper function to validate query parameters
export function validateQuery<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));
    
    throw {
      statusCode: 400,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      errors,
    };
  }
  
  return result.data;
}
