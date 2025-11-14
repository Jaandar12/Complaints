import { cn } from "@/lib/utils";

const badgeVariants: Record<string, string> = {
  NEW: "bg-blue-50 text-blue-700 ring-blue-200",
  ASSIGNED: "bg-sky-50 text-sky-700 ring-sky-200",
  IN_PROGRESS: "bg-amber-50 text-amber-700 ring-amber-200",
  MANAGEMENT_RESOLVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PENDING_TENANT_CONFIRMATION: "bg-purple-50 text-purple-700 ring-purple-200",
  REOPENED: "bg-rose-50 text-rose-700 ring-rose-200",
  REJECTED: "bg-slate-100 text-slate-700 ring-slate-200",
  CLOSED: "bg-slate-900 text-white ring-slate-900",
  default: "bg-slate-100 text-slate-700 ring-slate-200",
};

export function Badge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: keyof typeof badgeVariants | "default";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
        badgeVariants[variant] ?? badgeVariants.default
      )}
    >
      {label}
    </span>
  );
}
