export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'Manager' | 'Admin';
  created_at: string;
  last_login?: string;
}

export interface POL {
  id: number;
  po_number: string;
  client_name: string;
  total_order: number;
  po_date: string;
  delivery_date: string;
  status: 'Draft' | 'In Progress' | 'Completed' | 'Cancelled';
  created_by: number;
  created_at: string;
  updated_at: string;
  pol_details?: POLDetail[];
}

export interface POLDetail {
  id: number;
  pol_id: number;
  product_code: string;
  product_name: string;
  color: string;
  texture: string;
  material: string;
  size: string;
  final_size: string;
  order_quantity: number;
  extra_quantity_buffer: number;
  created_at: string;
  updated_at: string;
}

export interface ProductionRecord {
  id: number;
  pol_detail_id: number;
  production_stage: string;
  quantity: number;
  reject_quantity: number;
  remake_cycle: number;
  notes: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface DecorationTask {
  id: number;
  pol_detail_id: number;
  task_name: string;
  task_description: string;
  quantity_required: number;
  quantity_completed: number;
  quantity_rejected: number;
  status: 'Pending' | 'In Progress' | 'Completed';
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: number;
  pol_detail_id: number;
  alert_type: string;
  alert_message: string;
  priority: 'Critical' | 'Warning' | 'Info';
  status: 'Open' | 'Acknowledged' | 'Resolved';
  acknowledged_by?: number;
  acknowledged_at?: string;
  resolved_by?: number;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface LogbookEntry {
  id: number;
  pol_id?: number;
  pol_detail_id?: number;
  production_stage: string;
  issue_type: 'Material Issue' | 'Tool Issue' | 'Process Issue' | 'Quality Issue' | 'Other';
  description: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  resolution?: string;
  status: 'Open' | 'In Progress' | 'Resolved';
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface RevisionTicket {
  id: number;
  ticket_number: string;
  pol_id: number;
  pol_detail_id?: number;
  revision_type: 'Design Change' | 'Material Change' | 'Process Change' | 'Other';
  description: string;
  reason: string;
  impact_assessment?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Implemented';
  created_by: number;
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total_pols: number;
  active_pols: number;
  completed_this_month: number;
  delayed_pols: number;
  critical_alerts: number;
  warning_alerts: number;
  info_alerts: number;
  pols_by_status: { status: string; count: number }[];
  production_progress: { stage: string; progress: number }[];
}
