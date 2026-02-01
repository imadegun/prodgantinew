/**
 * Type definitions for the application
 */

import { Request } from 'express';

// User types
export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'MANAGER' | 'ADMIN' | 'WORKER';
  createdAt: Date;
  lastLogin?: Date;
}

// POL types
export interface POL {
  id: string;
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
  id: string;
  polId: string;
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
  id: string;
  polDetailId: string;
  stage: 'FORMING' | 'FIRING' | 'GLAZING' | 'QUALITY_CONTROL' | 'PACKAGING';
  quantity: number;
  userId: string;
  notes?: string;
  createdAt: Date;
}

export interface DecorationTask {
  id: string;
  polDetailId: string;
  taskName: string;
  description?: string;
  quantity: number;
  completed: boolean;
  userId?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Alert types
export interface DiscrepancyAlert {
  id: string;
  polId: string;
  polDetailId: string;
  stage: 'FORMING' | 'FIRING' | 'GLAZING' | 'QUALITY_CONTROL' | 'PACKAGING';
  expectedQuantity: number;
  actualQuantity: number;
  difference: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  reportedBy: string;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
  resolutionNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Logbook types
export interface LogbookEntry {
  id: string;
  polId?: string;
  userId: string;
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
  id: string;
  polId: string;
  polDetailId?: string;
  createdBy: string;
  type: 'DESIGN' | 'PRODUCTION' | 'MATERIAL' | 'OTHER';
  issueType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  proposedSolution?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  submittedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  managerNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Activity Log types
export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Request types
export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
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
  id: string;
  type: 'POL' | 'PRODUCTION' | 'ALERT' | 'LOGBOOK' | 'REVISION';
  title: string;
  description: string;
  timestamp: Date;
  userId: string;
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
  polId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface LogFilters {
  polId?: string;
  userId?: string;
  status?: 'NORMAL' | 'ISSUES' | 'RESOLVED';
  startDate?: Date;
  endDate?: Date;
}

export interface RevisionFilters {
  status?: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  type?: 'DESIGN' | 'PRODUCTION' | 'MATERIAL' | 'OTHER';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  polId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ReportFilters {
  startDate?: Date;
  endDate?: Date;
  polId?: string;
  productCode?: string;
}
