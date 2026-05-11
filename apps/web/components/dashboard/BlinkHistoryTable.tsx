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
            const linkClass =
              "block w-full text-left text-xs font-medium text-slate-600 underline-offset-2 transition-colors hover:text-purple-700 hover:underline lg:w-auto lg:text-right";
            const linkPrimary = `${linkClass} text-purple-700 hover:text-purple-800`;
            return (
              <li key={b.id}>
                <div className="grid grid-cols-[48px_1fr] gap-x-4 gap-y-4 px-4 py-5 sm:px-6 lg:grid-cols-[48px_minmax(0,1fr)_10.5rem_12.5rem] lg:items-center lg:gap-x-6 lg:gap-y-0">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-purple-50 ring-2 ring-purple-100 lg:self-center">
                    <Image
                      src={avatarSrc}
                      alt=""
                      width={48}
                      height={48}
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  <div className="min-w-0 space-y-1 lg:self-center">
                    <p className="truncate text-sm font-semibold text-slate-900">{b.contractorEmail}</p>
                    <p className="font-mono text-xs text-slate-500">Ref · {refLabel(b)}</p>
                    <p className="text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{dateLine}</span>
                      <span className="text-slate-400"> · </span>
                      {timeLine}
                    </p>
                  </div>

                  <div className="col-span-2 flex items-center justify-between gap-4 border-t border-slate-100 pt-4 sm:justify-start sm:gap-6 lg:col-span-1 lg:flex-col lg:items-end lg:justify-center lg:border-l lg:border-t-0 lg:border-slate-100 lg:pt-0 lg:pl-6">
                    <p className="whitespace-nowrap text-lg font-bold tabular-nums tracking-tight text-slate-900 lg:text-right">
                      {b.amountUsdc}
                      <span className="ml-1.5 text-sm font-semibold text-purple-600">USDC</span>
                    </p>
                    <div className="shrink-0">
                      <StatusBadge status={b.status} />
                    </div>
                  </div>

                  <div className="col-span-2 flex flex-col gap-3 lg:col-span-1 lg:border-l lg:border-slate-100 lg:pl-6">
                    <button
                      type="button"
                      disabled={downloadingId === b.id}
                      onClick={() => void onDownloadReceipt(b)}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition-colors hover:border-purple-300 hover:bg-purple-50/70 hover:text-purple-900 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Download className="h-4 w-4 shrink-0 text-purple-600" aria-hidden />
                      {downloadingId === b.id ? "Preparing…" : "Download"}
                    </button>
                    {canFund ? (
                      <div className="flex justify-end">
                        <FundBlinkButton blinkId={b.id} />
                      </div>
                    ) : null}
                    <nav
                      className="flex flex-col gap-2 border-t border-slate-100 pt-3 lg:items-end lg:gap-1.5"
                      aria-label={`Links for ${b.contractorEmail}`}
                    >
                      <Link
                        href={`${baseUrl}/blink/${b.id}`}
                        className={linkPrimary}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Contractor link
                      </Link>
                      {b.escrowPDA ? (
                        <a
                          href={solanaAddressExplorerUrl(b.escrowPDA)}
                          className={linkClass}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Escrow PDA
                        </a>
                      ) : null}
                      {b.escrowTxSig ? (
                        <a
                          href={solanaTxExplorerUrl(b.escrowTxSig)}
                          className={linkClass}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Fund tx
                        </a>
                      ) : null}
                      {b.claimTxSig ? (
                        <a
                          href={solanaTxExplorerUrl(b.claimTxSig)}
                          className={linkClass}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Claim tx
                        </a>
                      ) : null}
                    </nav>
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
