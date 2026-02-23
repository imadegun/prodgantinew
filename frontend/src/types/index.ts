export interface User {
  id: number;
  username: string;
  fullName: string;
  role: 'MANAGER' | 'ADMIN' | 'WORKER';
  createdAt: string;
  lastLogin?: string;
}

// API Response types (snake_case from backend)
export interface POL {
  id: number;
  polId?: number;
  po_number?: string;
  poNumber?: string;
  client_name?: string;
  customerName?: string;
  orderDate?: string;
  delivery_date?: string;
  deliveryDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
  createdBy?: number;
  created_at?: string;
  createdAt?: string;
  updatedAt?: string;
  total_order?: number;
  details?: POLDetail[];
}

export interface POLDetail {
  id: number;
  polId?: number;
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
  id: number;
  polDetailId?: number;
  stage: 'FORMING' | 'FIRING' | 'GLAZING' | 'QUALITY_CONTROL' | 'PACKAGING';
  quantity?: number;
  rejects?: number;
  userId?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DecorationTask {
  id: number;
  polDetailId?: number;
  taskName?: string;
  description?: string;
  quantity?: number;
  completed?: boolean;
  userId?: number;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Alert {
  id: number;
  pol_id?: number;
  polDetailId?: number;
  stage?: 'FORMING' | 'FIRING' | 'GLAZING' | 'QUALITY_CONTROL' | 'PACKAGING';
  expected_quantity?: number;
  actual_quantity?: number;
  difference?: number;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  reported_by?: number;
  acknowledged_by?: number;
  acknowledged_at?: string;
  resolved_by?: number;
  resolved_at?: string;
  resolution_notes?: string;
  alert_message?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LogbookEntry {
  id: number;
  pol_id?: number;
  polDetailId?: number;
  user_id?: number;
  entry_date?: string;
  status: 'NORMAL' | 'ISSUES' | 'RESOLVED';
  notes?: string;
  issues?: string;
  actions?: string;
  severity?: 'LOW' | 'MEDIUM' | 'HIGH';
  created_at?: string;
  updated_at?: string;
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
