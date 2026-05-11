"use client";

import Link from "next/link";
import { FundBlinkButton } from "@/components/dashboard/FundBlinkButton";
import type { BlinkRow } from "@/components/dashboard/EmployerSession";
import { useEmployerSession } from "@/components/dashboard/EmployerSession";
import { solanaAddressExplorerUrl, solanaTxExplorerUrl } from "@/lib/explorer";

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  OPENED: "bg-sky-50 text-sky-700 ring-sky-200",
  CLAIMED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OFFRAMPED: "bg-purple-50 text-purple-700 ring-purple-200",
  EXPIRED: "bg-slate-100 text-slate-700 ring-slate-200",
  REFUNDED: "bg-rose-50 text-rose-700 ring-rose-200",
};

function StatusBadge({ status }: { status: string }) {
  const styles = STATUS_STYLES[status] ?? "bg-slate-100 text-slate-700 ring-slate-200";
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ring-1 ring-inset ${styles}`}
    >
      {status.toLowerCase()}
    </span>
  );
}

export function BlinkHistoryTable() {
  const { blinks } = useEmployerSession();
  const baseUrl = (process.env.NEXT_PUBLIC_URL ?? "").replace(/\/$/, "");

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Payment History</h2>
        <p className="mt-1 text-sm text-slate-600">
          Manage your recent payments. Fund pending transactions to activate them for your
          contractors.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-purple-50/40 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-6 py-3 font-semibold">Status</th>
              <th className="px-6 py-3 font-semibold">Amount</th>
              <th className="px-6 py-3 font-semibold">Contractor</th>
              <th className="px-6 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blinks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-16 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-3">
                    <div
                      aria-hidden="true"
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-7 w-7 text-purple-500"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4 7h16M4 12h16M4 17h10"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <p className="text-base font-semibold text-slate-900">No payments yet</p>
                    <p className="text-sm text-slate-600">
                      Head over to the Payroll tab to create your first one.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              blinks.map((b: BlinkRow) => (
                <tr key={b.id} className="border-t border-slate-100 align-top">
                  <td className="px-6 py-4">
                    <StatusBadge status={b.status} />
                  </td>
                  <td className="px-6 py-4 font-medium tabular-nums text-slate-900">
                    {b.amountUsdc} <span className="text-xs text-slate-500">USDC</span>
                  </td>
                  <td className="px-6 py-4 text-slate-700">{b.contractorEmail}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`${baseUrl}/blink/${b.id}`}
                          className="text-xs font-semibold text-purple-600 hover:text-purple-700 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open contractor link
                        </Link>
                        {b.status === "PENDING" && !b.escrowTxSig && (
                          <FundBlinkButton blinkId={b.id} />
                        )}
                      </div>
                      {b.escrowPDA && (
                        <a
                          href={solanaAddressExplorerUrl(b.escrowPDA)}
                          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Escrow PDA
                        </a>
                      )}
                      {b.escrowTxSig && (
                        <a
                          href={solanaTxExplorerUrl(b.escrowTxSig)}
                          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Fund tx
                        </a>
                      )}
                      {b.claimTxSig && (
                        <a
                          href={solanaTxExplorerUrl(b.claimTxSig)}
                          className="text-xs text-slate-500 hover:text-slate-700 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Claim tx
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
