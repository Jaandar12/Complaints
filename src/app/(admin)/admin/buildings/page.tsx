import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBuildingSummaries } from "@/server/queries/buildings";

export default async function BuildingsPage() {
  const buildings = await getBuildingSummaries();
  return (
    <Card className="space-y-4">
      <CardHeader title="Buildings & Units" subtitle="Manage properties, floors, and automation rules" actions={<Button>New building</Button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {buildings.map((building) => (
          <div key={building.id} className="rounded-xl border border-slate-200 p-4">
            <p className="text-lg font-semibold text-slate-900">{building.name}</p>
            <p className="text-sm text-slate-500">{building.address}</p>
            <p className="text-sm text-slate-500">{building.unitCount} units</p>
            <p className="text-sm text-amber-600">{building.activeComplaints} active complaints</p>
            <div className="mt-4 flex gap-2">
              <Button variant="secondary" className="flex-1">
                Manage units
              </Button>
              <Button variant="ghost" className="flex-1">
                Download QR codes
              </Button>
            </div>
          </div>
        ))}
        {buildings.length === 0 && <p className="text-sm text-slate-500">No buildings configured yet.</p>}
      </div>
    </Card>
  );
}
