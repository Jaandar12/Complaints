"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ComplaintCategory } from "@/lib/types";

const complaintSchema = z.object({
  tenantName: z.string().min(2, "Name is required"),
  tenantContact: z.string().min(5, "Contact information is required"),
  description: z.string().min(10, "Describe the issue in a few words"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

export function NewComplaintForm({ unitPublicId, categories }: { unitPublicId: string; categories: ComplaintCategory[] }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      tenantName: "",
      tenantContact: "",
      description: "",
      categories: [],
    },
  });

  async function onSubmit(values: ComplaintFormValues) {
    setIsSubmitting(true);
    setStatusMessage(null);
    try {
      const response = await fetch("/api/tenant/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ unitPublicId, ...values }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setStatusMessage({ type: "error", message: payload.error ?? "Failed to submit complaint." });
      } else {
        reset();
        router.refresh();
        setStatusMessage({
          type: "success",
          message: "Complaint submitted. Management has been notified.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
      <div>
        <label className="text-sm font-medium text-slate-700">Tenant name</label>
        <input
          {...register("tenantName")}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {errors.tenantName && <p className="text-xs text-rose-600">{errors.tenantName.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Contact info</label>
        <input
          {...register("tenantContact")}
          placeholder="Email or phone"
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {errors.tenantContact && <p className="text-xs text-rose-600">{errors.tenantContact.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Categories</label>
        <div className="mt-2 flex flex-wrap gap-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="inline-flex cursor-pointer select-none items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 data-[state=checked]:border-blue-500 data-[state=checked]:bg-blue-50 data-[state=checked]:text-blue-700"
            >
              <input type="checkbox" value={category.id} {...register("categories")} className="sr-only" />
              {category.name}
            </label>
          ))}
        </div>
        {categories.length === 0 && (
          <p className="text-xs text-slate-500">Management has not configured categories yet.</p>
        )}
        {errors.categories && <p className="text-xs text-rose-600">{errors.categories.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Description</label>
        <textarea
          {...register("description")}
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
        {errors.description && <p className="text-xs text-rose-600">{errors.description.message}</p>}
      </div>
      <Button disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Submitting..." : "Submit complaint"}
      </Button>
      {statusMessage && (
        <p className={`text-sm ${statusMessage.type === "success" ? "text-emerald-600" : "text-rose-600"}`}>{statusMessage.message}</p>
      )}
    </form>
  );
}
