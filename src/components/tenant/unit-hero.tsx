import Image from "next/image";
import { UnitSummary } from "@/lib/types";
import { Alert } from "@/components/ui/alert";

export function UnitHero({ unit }: { unit: UnitSummary }) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Unit Complaint Portal</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            {unit.buildingName} • Unit {unit.unitNumber}
          </h1>
          <p className="text-sm text-slate-500">Floor {unit.floorNumber}</p>
          {unit.tenantName && <p className="text-sm text-slate-700">Tenant: {unit.tenantName}</p>}
        </div>
        {unit.imageUrl && (
          <Image
            src={unit.imageUrl}
            alt={unit.buildingName}
            width={160}
            height={100}
            className="rounded-lg object-cover"
          />
        )}
      </div>
      {unit.isBlocked && (
        <Alert
          variant="warning"
          title="Complaints are temporarily blocked"
          description="Please contact your building management for further assistance."
        />
      )}
    </div>
  );
}
