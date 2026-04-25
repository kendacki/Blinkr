"use client";

import Link from "next/link";
import { FundBlinkButton } from "@/components/dashboard/FundBlinkButton";
import type { BlinkRow } from "@/components/dashboard/EmployerSession";
import { useEmployerSession } from "@/components/dashboard/EmployerSession";
import { solanaAddressExplorerUrl, solanaTxExplorerUrl } from "@/lib/explorer";

export function BlinkHistoryTable() {
  const { blinks } = useEmployerSession();
  const baseUrl = (process.env.NEXT_PUBLIC_URL ?? "").replace(/\/$/, "");

  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-semibold">Payment history</h2>
        <p className="text-xs text-slate-500">Fund PENDING Blinks on-chain, then share the contractor link.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Contractor</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {blinks.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                  No Blinks yet. Create one from Payroll.
                </td>
              </tr>
            ) : (
              blinks.map((b: BlinkRow) => (
                <tr key={b.id} className="border-b border-slate-50">
                  <td className="px-4 py-3 font-medium">{b.status}</td>
                  <td className="px-4 py-3 tabular-nums">{b.amountUsdc}</td>
                  <td className="px-4 py-3">{b.contractorEmail}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`${baseUrl}/blink/${b.id}`}
                          className="text-xs font-medium text-blinkr hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open contractor link
                        </Link>
                        {b.status === "PENDING" && !b.escrowTxSig && <FundBlinkButton blinkId={b.id} />}
                      </div>
                      {b.escrowPDA && (
                        <a
                          href={solanaAddressExplorerUrl(b.escrowPDA)}
                          className="text-xs text-slate-600 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Escrow PDA
                        </a>
                      )}
                      {b.escrowTxSig && (
                        <a
                          href={solanaTxExplorerUrl(b.escrowTxSig)}
                          className="text-xs text-slate-600 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Fund tx
                        </a>
                      )}
                      {b.claimTxSig && (
                        <a
                          href={solanaTxExplorerUrl(b.claimTxSig)}
                          className="text-xs text-slate-600 hover:underline"
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
