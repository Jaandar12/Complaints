import { PropsWithChildren, TdHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Table({ children }: PropsWithChildren) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 bg-white">
        {children}
      </table>
    </div>
  );
}

export function THead({ children }: PropsWithChildren) {
  return <thead className="bg-slate-50">{children}</thead>;
}

export function Th({
  children,
  align = "left",
}: PropsWithChildren<{ align?: "left" | "center" | "right" }>) {
  return (
    <th
      className={cn(
        "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500",
        align === "center" && "text-center",
        align === "right" && "text-right"
      )}
    >
      {children}
    </th>
  );
}

export function TBody({ children }: PropsWithChildren) {
  return <tbody className="divide-y divide-slate-200">{children}</tbody>;
}

type TdProps = PropsWithChildren<
  {
    align?: "left" | "center" | "right";
    className?: string;
  } & TdHTMLAttributes<HTMLTableCellElement>
>;

export function Td({ children, align = "left", className, ...rest }: TdProps) {
  return (
    <td
      {...rest}
      className={cn(
        "px-4 py-3 text-sm text-slate-700",
        align === "center" && "text-center",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}
