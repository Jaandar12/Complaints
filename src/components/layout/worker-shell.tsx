"use client";

import { PropsWithChildren } from "react";
import { Bell } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import type { SessionUser } from "@/lib/auth";

export function WorkerShell({ children, currentUser }: PropsWithChildren<{ currentUser: SessionUser }>) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <p className="text-lg font-semibold text-slate-900">Worker Portal</p>
            <p className="text-sm text-slate-500">
              Welcome back, {currentUser.fullName ?? currentUser.email}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
