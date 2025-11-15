import { Button } from "@/components/ui/button";
import { Building2, QrCode } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-16 px-6 py-24">
        <div className="space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-300">Modern Tenant Support</p>
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">
            Scan. Report. Resolve.
            <br />
            Complaints without friction.
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-slate-200">
            Every unit has a QR code that opens a secure, unit-specific complaint portal. Management teams track issues,
            route work orders, and close the feedback loop with analytics-grade visibility.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/unit/demo-unit"
              className="w-48 rounded-full bg-blue-600 px-6 py-3 text-center text-sm font-semibold text-white shadow transition hover:bg-blue-500"
            >
              Preview Tenant Portal
            </Link>
            <Link
              href="/admin"
              className="w-48 rounded-full border border-white/30 bg-white/10 px-6 py-3 text-center text-sm font-semibold text-white shadow transition hover:bg-white/20"
            >
              Launch Admin Console
            </Link>
          </div>
        </div>
        <div className="grid w-full gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-200">
              <QrCode className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Tenant QR Experience</h3>
            <p className="text-sm text-slate-200">
              Scan the QR code posted inside each unit to view current ticket status, upload photos, and submit a single
              active complaint with guardrails enforced in Supabase.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-200">
              <Building2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold">Operations Console</h3>
            <p className="text-sm text-slate-200">
              RBAC-driven admin portal for Super Admins, Admins, Management Staff, and Service Workers with analytics,
              assignments, and audit trails built on Supabase PostgreSQL + Auth.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
