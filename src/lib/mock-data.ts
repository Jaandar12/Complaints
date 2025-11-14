import { Complaint, UnitSummary } from "@/lib/types";

export const mockComplaint: Complaint = {
  id: "cmp_demo_001",
  unitId: "unit_demo_001",
  buildingName: "Harbor View Tower",
  unitNumber: "18B",
  status: "IN_PROGRESS",
  categories: [
    { id: "electricity", name: "Electricity" },
    { id: "water", name: "Water Leakage" },
  ],
  description: "Power outage in the living room and noticeable leak near the balcony door.",
  tenantName: "Priya Patel",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  assignedWorkers: ["svc_alex", "svc_carlos"],
  agingSeconds: 3600 * 6,
  timeline: [
    {
      status: "NEW",
      changedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      note: "Complaint submitted via QR portal.",
    },
    {
      status: "ASSIGNED",
      changedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      changedBy: "Jia (Admin)",
      note: "Assigned to electrician team.",
    },
    {
      status: "IN_PROGRESS",
      changedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      changedBy: "Alex Rivera",
      note: "On-site inspection started.",
    },
  ],
};

export const mockUnit: UnitSummary = {
  id: "unit_demo_001",
  publicId: "11111111-1111-1111-1111-111111111111",
  buildingName: "Harbor View Tower",
  floorNumber: 18,
  unitNumber: "18B",
  tenantName: "Priya Patel",
  isBlocked: false,
  imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=900&q=80",
  activeComplaint: mockComplaint,
  canSubmit: false,
};

export const mockComplaintsFeed: Complaint[] = [mockComplaint].concat(
  Array.from({ length: 5 }).map((_, index) => ({
    ...mockComplaint,
    id: `cmp_mock_${index}`,
    status: index % 2 === 0 ? "NEW" : "ASSIGNED",
    buildingName: index % 2 === 0 ? "Summerset Residences" : "Laguna Offices",
    unitNumber: `${10 + index}A`,
    agingSeconds: 3600 * (index + 1),
    categories: [{ id: "hvac", name: "HVAC" }],
  }))
);

export const mockCategories = [
  { id: "electricity", name: "Electricity", is_active: true },
  { id: "water", name: "Water Leakage", is_active: true },
  { id: "housekeeping", name: "Housekeeping", is_active: true },
];
