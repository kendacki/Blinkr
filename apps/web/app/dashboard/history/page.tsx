"use client";

import { BlinkHistoryTable } from "@/components/dashboard/BlinkHistoryTable";
import { useEmployerSession } from "@/components/dashboard/EmployerSession";

export default function HistoryPage() {
  const { error, jwt } = useEmployerSession();

  return (
    <>
      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {jwt ? (
        <BlinkHistoryTable />
      ) : (
        <p className="text-sm text-slate-600">Sign in to view Blink history.</p>
      )}
    </>
  );
}
