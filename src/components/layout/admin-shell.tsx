"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, LayoutDashboard, ListChecks, Settings, Users } from "lucide-react";
import { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";
import { LogoutButton } from "@/components/auth/logout-button";
import type { SessionUser } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/complaints", label: "Complaints", icon: ListChecks },
  { href: "/admin/buildings", label: "Buildings & Units", icon: Building2 },
  { href: "/admin/workers", label: "Service Workers", icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Settings },
];

export function AdminShell({ children, currentUser }: PropsWithChildren<{ currentUser: SessionUser }>) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <aside className="hidden min-h-screen w-64 flex-shrink-0 border-r border-slate-200 bg-white px-4 py-6 lg:block">
          <div className="mb-8 px-2">
            <p className="text-lg font-semibold text-slate-900">Complaints Portal</p>
            <p className="text-xs text-slate-500">Operations Console</p>
          </div>
          <nav className="space-y-1">
            {navItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition",
                  pathname === href ? "bg-slate-100 text-slate-900" : "text-slate-600 hover:bg-slate-50"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </nav>
        </aside>
        <main className="flex-1">
          <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
              <div>
                <p className="text-sm text-slate-500">Logged in as</p>
                <p className="text-sm font-semibold text-slate-900">
                  {currentUser.fullName ?? currentUser.email} • {currentUser.role.replaceAll("_", " ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button className="relative rounded-full p-2 text-slate-500 transition hover:bg-slate-100" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </button>
                <LogoutButton />
              </div>
            </div>
          </header>
          <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
