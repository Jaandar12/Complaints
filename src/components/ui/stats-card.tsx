import { Card } from "@/components/ui/card";

export function StatsCard({
  label,
  value,
  delta,
  hint,
}: {
  label: string;
  value: string | number;
  delta?: string;
  hint?: string;
}) {
  return (
    <Card className="space-y-1">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {delta && <p className="text-xs text-emerald-600">{delta}</p>}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </Card>
  );
}
