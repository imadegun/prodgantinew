/**
 * Type definitions for the application
 */

import { Request } from 'express';

// User types
export interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'MANAGER' | 'ADMIN' | 'WORKER';
  createdAt: Date;
  lastLogin?: Date;
}

// POL types
export interface POL {
  id: number;
  polNumber: string;
  customerName: string;
  orderDate: Date;
  deliveryDate: Date;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface POLDetail {
  id: number;
  polId: number;
  productCode: string;
  productName: string;
  quantity: number;
  productType: 'PLAIN' | 'DECOR' | 'HAND_BUILT' | 'SLAB_TRAY';
  color?: string;
  texture?: string;
  material?: string;
  size?: string;
  finalSize?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Production types
export interface ProductionRecord {
  id: number;
  polDetailId: number;
  stage: 'FORMING' | 'FIRING' | 'GLAZING' | 'QUALITY_CONTROL' | 'PACKAGING';
  quantity: number;
  userId: number;
  notes?: string;
  createdAt: Date;
}

export interface DecorationTask {
  id: number;
  polDetailId: number;
  taskName: string;
  description?: string;
  quantity: number;
  completed: boolean;
  userId?: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Alert types
export interface DiscrepancyAlert {
  id: number;
  polId: number;
  polDetailId: number;
  stage: 'FORMING' | 'FIRING' | 'GLAZING' | 'QUALITY_CONTROL' | 'PACKAGING';
  expectedQuantity: number;
  actualQuantity: number;
  difference: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  reportedBy: number;
  acknowledgedBy?: number;
  acknowledgedAt?: Date;
  resolvedBy?: number;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Logbook types
export interface LogbookEntry {
  id: number;
  polId?: number;
  userId: number;
  entryDate: Date;
  status: 'NORMAL' | 'ISSUES' | 'RESOLVED';
  notes: string;
  issues?: string;
  actions?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Revision types
export interface RevisionTicket {
  id: number;
  polId: number;
  polDetailId?: number;
  createdBy: number;
  type: 'DESIGN' | 'PRODUCTION' | 'MATERIAL' | 'OTHER';
  issueType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  proposedSolution?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  submittedAt?: Date;
  approvedBy?: number;
  approvedAt?: Date;
  managerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Log types
export interface ActivityLog {
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId?: number;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Request types
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Product types (from gayafusionall)
export interface Product {
  productCode: string;
  productName: string;
  color: string;
  texture: string;
  material: string;
  size: string;
  finalSize: string;
}

export interface ProductDetail extends Product {
  clayType: string;
  clayQuantity: number;
  glaze: string | null;
  engobe: string | null;
  luster: string | null;
  stainsOxides: string | null;
  castingTools: string | null;
  extruders: string | null;
  textures: string | null;
  generalTools: string | null;
  buildNotes: string;
}

// Dashboard types
export interface DashboardStats {
  totalPOLs: number;
  activePOLs: number;
  completedPOLs: number;
  pendingPOLs: number;
  totalProducts: number;
  inProduction: number;
  completedProducts: number;
  openAlerts: number;
  highPriorityAlerts: number;
  pendingRevisions: number;
  todayLogEntries: number;
}

export interface RecentActivity {
  id: number;
  type: 'POL' | 'PRODUCTION' | 'ALERT' | 'LOGBOOK' | 'REVISION';
  title: string;
  description: string;
  timestamp: Date;
  userId: number;
  userName: string;
}

// Report types
export interface POLSummary {
  polNumber: string;
  customerName: string;
  orderDate: Date;
  deliveryDate: Date;
  status: string;
  totalQuantity: number;
  completedQuantity: number;
  progress: number;
  productCount: number;
}

export interface ProductionProgress {
  polNumber: string;
  customerName: string;
  orderDate: Date;
  deliveryDate: Date;
  status: string;
  details: {
    productCode: string;
    productName: string;
    quantity: number;
    stageProgress: Record<string, {
      quantity: number;
      records: number;
    }>;
  }[];
}

// Filter types
export interface POLFilters {
  status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  customerName?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface AlertFilters {
  status?: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  polId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface LogFilters {
  polId?: number;
  userId?: number;
  status?: 'NORMAL' | 'ISSUES' | 'RESOLVED';
  startDate?: Date;
  endDate?: Date;
}

export interface RevisionFilters {
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  type?: 'DESIGN' | 'PRODUCTION' | 'MATERIAL' | 'OTHER';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  polId?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  polId?: number;
  productCode?: string;
}
