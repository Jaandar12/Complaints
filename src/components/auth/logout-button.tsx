"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogout() {
    setIsLoading(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.replace("/login");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Button variant="secondary" onClick={handleLogout} disabled={isLoading}>
      {isLoading ? "Signing out..." : "Logout"}
    </Button>
  );
}
