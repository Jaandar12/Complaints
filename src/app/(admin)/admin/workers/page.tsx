import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getServiceWorkers } from "@/server/queries/workers";

export default async function WorkersPage() {
  const workers = await getServiceWorkers();
  return (
    <Card className="space-y-4">
      <CardHeader title="Service workers" subtitle="Track workload and performance" actions={<Button>Add worker</Button>} />
      <div className="space-y-3">
        {workers.map((worker) => (
          <div key={worker.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
            <div>
              <p className="text-base font-semibold text-slate-900">{worker.name}</p>
              <p className="text-sm text-slate-500">{worker.type ?? "General"}</p>
            </div>
            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-xs text-slate-500">Pending</p>
                <p className="font-medium text-slate-900">{worker.pendingJobs}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Resolved (30d)</p>
                <p className="font-medium text-slate-900">{worker.resolved30d}</p>
              </div>
              <Button variant="secondary" className="self-start">
                View detail
              </Button>
            </div>
          </div>
        ))}
        {workers.length === 0 && <p className="text-sm text-slate-500">No service workers yet.</p>}
      </div>
    </Card>
  );
}
