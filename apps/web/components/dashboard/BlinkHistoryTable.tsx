"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { Download } from "lucide-react";
import type { BlinkRow } from "@/components/dashboard/EmployerSession";
import { useEmployerSession } from "@/components/dashboard/EmployerSession";
import { FundBlinkButton } from "@/components/dashboard/FundBlinkButton";
import { dicebearInitialsUrl, formatBlinkDateTime, truncateMiddle } from "@/lib/blinkDisplayFormat";
import { downloadBlinkReceiptPdf } from "@/lib/pdf/blinkPdfDocuments";
import { solanaAddressExplorerUrl, solanaTxExplorerUrl } from "@/lib/explorer";

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-900 ring-1 ring-amber-200/90",
  OPENED: "bg-sky-100 text-sky-900 ring-1 ring-sky-200/90",
  CLAIMED: "bg-emerald-100 text-emerald-900 ring-1 ring-emerald-200/90",
  OFFRAMPED: "bg-purple-100 text-purple-900 ring-1 ring-purple-200/90",
  EXPIRED: "bg-slate-100 text-slate-800 ring-1 ring-slate-200/90",
  REFUNDED: "bg-rose-100 text-rose-900 ring-1 ring-rose-200/90",
};

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_BADGE[status] ?? "bg-slate-100 text-slate-800 ring-1 ring-slate-200/90";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${cls}`}>
      {status.toLowerCase()}
    </span>
  );
}

function sortBlinksDesc(blinks: BlinkRow[]): BlinkRow[] {
  return [...blinks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function BlinkHistoryTable() {
  const { blinks } = useEmployerSession();
  const baseUrl = (process.env.NEXT_PUBLIC_URL ?? "").replace(/\/$/, "");
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const rows = useMemo(() => sortBlinksDesc(blinks), [blinks]);

  const onDownloadReceipt = useCallback(async (row: BlinkRow) => {
    setDownloadingId(row.id);
    try {
      await downloadBlinkReceiptPdf(row);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloadingId(null);
    }
  }, []);

  const refLabel = (b: BlinkRow) => truncateMiddle(b.escrowTxSig ?? b.claimTxSig ?? b.id, 8, 6);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm font-[var(--font-poppins)]">
      <div className="border-b border-slate-100 px-4 py-6 sm:px-6">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Payment History</h2>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Manage your recent payments. Fund pending transactions to activate them for your contractors.
        </p>
      </div>

      {blinks.length === 0 ? (
        <div className="px-4 py-16 text-center sm:px-6">
          <div className="mx-auto flex max-w-md flex-col items-center gap-3">
            <div
              aria-hidden="true"
              className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 ring-1 ring-purple-100"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 text-purple-600" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 7h16M4 12h16M4 17h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-base font-semibold text-slate-900">No payments yet</p>
            <p className="text-sm text-slate-600">Head over to the Payroll tab to create your first one.</p>
          </div>
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((b) => {
            const { dateLine, timeLine } = formatBlinkDateTime(b.createdAt);
            const avatarSrc = dicebearInitialsUrl(b.contractorEmail);
            const canFund = b.status === "PENDING" && !b.escrowTxSig;
            return (
              <li key={b.id}>
                <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 md:flex-row md:items-center md:gap-6">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-purple-50 ring-2 ring-purple-100">
                    <Image
                      src={avatarSrc}
                      alt=""
                      width={48}
                      height={48}
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-900">{b.contractorEmail}</p>
                    </div>
                    <p className="font-mono text-xs text-slate-500">Ref · {refLabel(b)}</p>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{dateLine}</span>
                      <span className="text-slate-400"> · </span>
                      {timeLine}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 md:flex-col md:items-end md:gap-2">
                    <p className="text-lg font-bold tabular-nums text-slate-900">
                      {b.amountUsdc}
                      <span className="ml-1 text-sm font-semibold text-purple-600">USDC</span>
                    </p>
                    <StatusBadge status={b.status} />
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 md:w-52 md:shrink-0 md:border-t-0 md:pt-0 md:items-end">
                    <button
                      type="button"
                      disabled={downloadingId === b.id}
                      onClick={() => void onDownloadReceipt(b)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-purple-300 hover:bg-purple-50/60 hover:text-purple-900 disabled:cursor-not-allowed disabled:opacity-60 lg:w-auto"
                    >
                      <Download className="h-4 w-4 text-purple-600" aria-hidden />
                      {downloadingId === b.id ? "Preparing…" : "Download"}
                    </button>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium">
                      <Link
                        href={`${baseUrl}/blink/${b.id}`}
                        className="text-purple-600 hover:text-purple-800 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Contractor link
                      </Link>
                      {canFund ? <FundBlinkButton blinkId={b.id} /> : null}
                      {b.escrowPDA ? (
                        <a
                          href={solanaAddressExplorerUrl(b.escrowPDA)}
                          className="text-slate-500 hover:text-slate-800 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Escrow PDA
                        </a>
                      ) : null}
                      {b.escrowTxSig ? (
                        <a
                          href={solanaTxExplorerUrl(b.escrowTxSig)}
                          className="text-slate-500 hover:text-slate-800 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Fund tx
                        </a>
                      ) : null}
                      {b.claimTxSig ? (
                        <a
                          href={solanaTxExplorerUrl(b.claimTxSig)}
                          className="text-slate-500 hover:text-slate-800 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Claim tx
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
