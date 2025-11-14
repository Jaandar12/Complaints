export type UserRole = "SUPER_ADMIN" | "ADMIN" | "MANAGEMENT" | "SERVICE_WORKER";

export type ComplaintStatus =
  | "NEW"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "MANAGEMENT_RESOLVED"
  | "PENDING_TENANT_CONFIRMATION"
  | "REOPENED"
  | "REJECTED"
  | "CLOSED";

export type ComplaintCategory = {
  id: string;
  name: string;
  category_group?: string | null;
  is_active?: boolean;
};

export type Complaint = {
  id: string;
  unitId: string;
  buildingName: string;
  unitNumber: string;
  status: ComplaintStatus;
  categories: ComplaintCategory[];
  description: string;
  tenantName?: string;
  createdAt: string;
  updatedAt: string;
  assignedWorkers: string[];
  agingSeconds: number;
  timeline: Array<{
    status: ComplaintStatus;
    changedAt: string;
    changedBy?: string;
    note?: string;
  }>;
};

export type UnitSummary = {
  id: string;
  publicId: string;
  buildingName: string;
  floorNumber: number;
  unitNumber: string;
  tenantName?: string;
  isBlocked: boolean;
  imageUrl?: string;
  activeComplaint: Complaint | null;
  canSubmit: boolean;
};

export type ComplaintOverviewRow = {
  id: string;
  building_name: string;
  unit_number: string;
  status: ComplaintStatus;
  categories: string[];
  worker_names: string[];
  aging_seconds: number;
};

export const complaintStatusLabels: Record<ComplaintStatus, string> = {
  NEW: "New",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  MANAGEMENT_RESOLVED: "Management Resolved",
  PENDING_TENANT_CONFIRMATION: "Awaiting Tenant Confirmation",
  REOPENED: "Reopened",
  REJECTED: "Rejected",
  CLOSED: "Closed",
};
