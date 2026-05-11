"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/marketing/LogoMark";
import { EmployerSessionProvider, useEmployerSession } from "@/components/dashboard/EmployerSession";

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { jwt, wallet, balance, loading, connectPhantom, disconnect, refresh } = useEmployerSession();

  const link = (href: string, label: string) => {
    const active = pathname === href;
    return (
      <Link
        href={href}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          active
            ? "bg-purple-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-purple-50 hover:text-purple-700"
        }`}
      >
        {label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-poppins)] text-slate-900">
      <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <LogoMark href="/" size={40} priority />
            <div className="flex flex-wrap items-center gap-2">
              {jwt ? (
                <>
                  <span className="max-w-[200px] truncate rounded-full bg-slate-100 px-3 py-1.5 font-mono text-xs text-slate-700">
                    {wallet}
                  </span>
                  <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700">
                    {balance ?? "—"} USDC
                  </span>
                  <button
                    type="button"
                    onClick={() => void refresh()}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={disconnect}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => void connectPhantom()}
                  disabled={loading}
                  className="rounded-full bg-purple-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? "Connecting…" : "Connect Phantom"}
                </button>
              )}
            </div>
          </div>
          <nav className="flex flex-wrap gap-2" aria-label="Dashboard sections">
            {link("/dashboard/payroll", "Payroll")}
            {link("/dashboard/history", "History")}
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
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
