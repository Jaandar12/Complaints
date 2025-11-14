"use client";

import { useQuery } from "@tanstack/react-query";
import type { ComplaintOverviewRow } from "@/lib/types";

type Filters = {
  status?: string[];
};

export function useComplaints(filters: Filters) {
  return useQuery({
    queryKey: ["complaints", filters],
    queryFn: async (): Promise<ComplaintOverviewRow[]> => {
      const params = new URLSearchParams();
      filters.status?.forEach((status) => params.append("status", status));
      const response = await fetch(`/api/admin/complaints?${params.toString()}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Failed to load complaints");
      }
      return response.json();
    },
    staleTime: 30_000,
  });
}
