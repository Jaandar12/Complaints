import { cn } from "@/lib/utils";
import { AlertTriangle, CheckCircle2, Info, OctagonAlert } from "lucide-react";

const variantStyles = {
  info: {
    wrapper: "bg-slate-50 text-slate-900 border-slate-200",
    icon: <Info className="h-5 w-5 text-slate-500" />,
  },
  warning: {
    wrapper: "bg-amber-50 text-amber-900 border-amber-200",
    icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
  },
  success: {
    wrapper: "bg-emerald-50 text-emerald-900 border-emerald-200",
    icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  },
  danger: {
    wrapper: "bg-rose-50 text-rose-900 border-rose-200",
    icon: <OctagonAlert className="h-5 w-5 text-rose-500" />,
  },
};

export function Alert({
  variant = "info",
  title,
  description,
}: {
  variant?: keyof typeof variantStyles;
  title: string;
  description?: string;
}) {
  const styles = variantStyles[variant];
  return (
    <div className={cn("flex items-start gap-3 rounded-lg border px-4 py-3", styles.wrapper)}>
      {styles.icon}
      <div>
        <p className="font-semibold">{title}</p>
        {description && <p className="text-sm opacity-80">{description}</p>}
      </div>
    </div>
  );
}
