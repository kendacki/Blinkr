"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { EmployerSessionProvider, useEmployerSession } from "@/components/dashboard/EmployerSession";

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { jwt, wallet, balance, loading, connectPhantom, disconnect, refresh } = useEmployerSession();

  const link = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`rounded-lg px-3 py-2 text-sm font-medium ${
          active ? "bg-blinkr text-white" : "text-slate-600 hover:bg-slate-100"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-lg font-bold text-blinkr">Blinkr</h1>
              <p className="text-xs text-slate-500">Employer dashboard (Layer 1)</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {jwt ? (
                <>
                  <span className="max-w-[200px] truncate rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs">
                    {wallet}
                  </span>
                  <span className="rounded-lg bg-blinkr-muted px-2 py-1 text-xs font-semibold text-blinkr-dark">
                    {balance ?? "—"} USDC
                  </span>
                  <button
                    type="button"
                    onClick={() => void refresh()}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={disconnect}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium hover:bg-slate-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void connectPhantom()}
                  disabled={loading}
                  className="rounded-lg bg-blinkr px-4 py-2 text-sm font-semibold text-white hover:bg-blinkr-dark disabled:opacity-50"
                >
                  Connect Phantom
                </button>
              )}
            </div>
          </div>
          <nav className="flex flex-wrap gap-2 border-t border-slate-100 pt-3" aria-label="Dashboard sections">
            {link("/dashboard/payroll", "Payroll")}
            {link("/dashboard/history", "History")}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <EmployerSessionProvider>
      <DashboardChrome>{children}</DashboardChrome>
    </EmployerSessionProvider>
  );
}
