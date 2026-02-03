export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'MANAGER' | 'ADMIN' | 'WORKER';
  createdAt: string;
  lastLogin?: string;
}

// API Response types (snake_case from backend)
export interface POL {
  id: string;
  po_number?: string;
  polNumber?: string;
  client_name?: string;
  customerName?: string;
  orderDate?: string;
  delivery_date?: string;
  deliveryDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdBy?: string;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
  total_order?: number;
  details?: POLDetail[];
}

export interface POLDetail {
  id: string;
  polId?: string;
  productCode?: string;
  productName?: string;
  quantity?: number;
  productType?: string;
  color?: string;
  texture?: string;
  material?: string;
  size?: string;
  finalSize?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductionRecord {
  id: string;
  polDetailId?: string;
  stage: 'FORMING' | 'FIRING' | 'GLAZING' | 'QUALITY_CONTROL' | 'PACKAGING';
  quantity?: number;
  rejects?: number;
  userId?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DecorationTask {
  id: string;
  polDetailId?: string;
  taskName?: string;
  description?: string;
  quantity?: number;
  completed?: boolean;
  userId?: string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Alert {
  id: string;
  polId?: string;
  polDetailId?: string;
  stage?: 'FORMING' | 'FIRING' | 'GLAZING' | 'QUALITY_CONTROL' | 'PACKAGING';
  expectedQuantity?: number;
  actualQuantity?: number;
  difference?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  reportedBy?: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedBy?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  alertMessage?: string;
  alert_message?: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
}

export interface LogbookEntry {
  id: string;
  polId?: string;
  polDetailId?: string;
  userId?: string;
  entryDate?: string;
  status: 'NORMAL' | 'ISSUES' | 'RESOLVED';
  notes?: string;
  issues?: string;
  actions?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt?: string;
  updatedAt?: string;
}

export interface RevisionTicket {
  id: string;
  polId?: string;
  polDetailId?: string;
  createdBy?: string;
  type: 'DESIGN' | 'PRODUCTION' | 'MATERIAL' | 'OTHER';
  issueType?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  description?: string;
  proposedSolution?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'IMPLEMENTED';
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  managerNotes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DashboardStats {
  total_pols?: number;
  active_pols?: number;
  completed_this_month?: number;
  delayed_pols?: number;
  critical_alerts?: number;
  warning_alerts?: number;
  info_alerts?: number;
  pols_by_status?: { status: string; count: number }[];
  production_progress?: { stage: string; progress: number }[];
  recent_alerts?: Alert[];
}
