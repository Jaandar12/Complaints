import { UnitHero } from "@/components/tenant/unit-hero";
import { ComplaintTimeline } from "@/components/tenant/complaint-timeline";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewComplaintForm } from "@/components/forms/new-complaint-form";
import { getUnitByPublicId } from "@/server/queries/units";
import { formatDistanceToNow } from "date-fns";
import { getActiveCategories } from "@/server/queries/categories";

export default async function UnitPage({ params }: { params: { unitPublicId: string } }) {
  const [unit, categories] = await Promise.all([getUnitByPublicId(params.unitPublicId), getActiveCategories()]);
  if (!unit) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <Alert variant="danger" title="Unit not found" description="Please scan the QR code again or contact management." />
      </div>
    );
  }

  const complaint = unit.activeComplaint;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-white to-white">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-10">
        <UnitHero unit={unit} />
        {complaint ? (
          <Card className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">Active complaint</p>
                <h2 className="text-xl font-semibold text-slate-900">{complaint.description}</h2>
                <p className="text-xs text-slate-500">
                  Opened {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                </p>
              </div>
              <Badge label={complaint.status.replaceAll("_", " ")} variant={complaint.status} />
            </div>
            <ComplaintTimeline complaint={complaint} />
            <Alert
              variant="info"
              title="Need to update this ticket?"
              description="If the issue is resolved, tap 'Mark as resolved' in the management message thread."
            />
          </Card>
        ) : unit.isBlocked ? (
          <Alert
            variant="warning"
            title="Complaints disabled"
            description="This unit is currently blocked from sending complaints."
          />
        ) : (
          <NewComplaintForm unitPublicId={unit.publicId} categories={categories} />
        )}
      </div>
    </div>
  );
}
