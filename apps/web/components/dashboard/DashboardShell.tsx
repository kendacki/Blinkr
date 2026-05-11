"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Wand2 } from "lucide-react";
import { LogoMark } from "@/components/marketing/LogoMark";
import { DashboardDemoProvider, useDashboardDemo } from "@/components/dashboard/DashboardDemoContext";
import { EmployerSessionProvider, useEmployerSession } from "@/components/dashboard/EmployerSession";

function DashboardChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { jwt, balance, loading, connectPhantom, disconnect, refresh } = useEmployerSession();
  const { appendMockTransactions } = useDashboardDemo();

  const handleDisconnect = () => {
    disconnect();
    router.push("/dashboard/payroll");
  };

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
                  <span className="rounded-full bg-purple-100 px-3 py-1.5 text-xs font-semibold text-purple-700">
                    {balance ?? "—"} USDC
                  </span>
                  <button
                    type="button"
                    onClick={() => appendMockTransactions(5)}
                    title="Append demo rows to Payment History (not saved to Blinkr)"
                    className="inline-flex items-center justify-center rounded-full border border-dashed border-purple-300 bg-purple-50/80 p-2 text-purple-700 transition-colors hover:bg-purple-100"
                    aria-label="Populate mock data"
                  >
                    <Wand2 className="h-4 w-4" aria-hidden />
                  </button>
                  <button
                    type="button"
                    onClick={() => void refresh()}
                    className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Refresh
                  </button>
                  <button
                    type="button"
                    onClick={handleDisconnect}
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
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-500 px-6 py-3 font-[var(--font-poppins)] text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-px hover:bg-purple-600 disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {loading ? "Connecting…" : "Connect Phantom"}
                </button>
              )}
            </div>
          </div>
          {jwt ? (
            <nav className="flex flex-wrap gap-2" aria-label="Dashboard sections">
              {link("/dashboard/payroll", "Payroll")}
              {link("/dashboard/history", "History")}
            </nav>
          ) : null}
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <EmployerSessionProvider>
      <DashboardDemoProvider>
        <DashboardChrome>{children}</DashboardChrome>
      </DashboardDemoProvider>
    </EmployerSessionProvider>
  );
}
