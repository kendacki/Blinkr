"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Download, FileText } from "lucide-react";
import type { BlinkRow } from "@/components/dashboard/EmployerSession";
import { useEmployerSession } from "@/components/dashboard/EmployerSession";
import { useDashboardDemo } from "@/components/dashboard/DashboardDemoContext";
import { FundBlinkButton } from "@/components/dashboard/FundBlinkButton";
import { dicebearInitialsUrl, formatBlinkDateTime, truncateMiddle } from "@/lib/blinkDisplayFormat";
import { downloadBlinkInvoicePdf, downloadBlinkReceiptPdf } from "@/lib/pdf/blinkPdfDocuments";
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

type ListEntry = { row: BlinkRow; isMock: boolean };

function mergeAndSort(blinks: BlinkRow[], mockBlinks: BlinkRow[]): ListEntry[] {
  const merged: ListEntry[] = [
    ...blinks.map((row) => ({ row, isMock: false })),
    ...mockBlinks.map((row) => ({ row, isMock: true })),
  ];
  merged.sort((a, b) => new Date(b.row.createdAt).getTime() - new Date(a.row.createdAt).getTime());
  return merged;
}

function InvoiceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [billedTo, setBilledTo] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const submit = async () => {
    const email = billedTo.trim();
    const desc = description.trim();
    const amt = amount.trim();
    if (!email || !desc || !amt) return;
    setBusy(true);
    try {
      const invoiceNo = `INV-${Date.now().toString(36).toUpperCase()}`;
      const issued = new Date();
      const { dateLine, timeLine } = formatBlinkDateTime(issued.toISOString());
      await downloadBlinkInvoicePdf({
        invoiceNo,
        issuedDate: `${dateLine} · ${timeLine}`,
        billedToEmail: email,
        description: desc,
        amountUsdc: amt,
      });
      onClose();
      setBilledTo("");
      setDescription("");
      setAmount("");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="invoice-modal-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl font-[var(--font-poppins)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="invoice-modal-title" className="text-lg font-bold tracking-tight text-slate-900">
              Create invoice
            </h2>
            <p className="mt-1 text-sm text-slate-600">Generate a Blinkr-branded PDF for your records.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-medium text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="inv-to">
              Billed to (email)
            </label>
            <input
              id="inv-to"
              type="email"
              value={billedTo}
              onChange={(e) => setBilledTo(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none ring-purple-500/0 transition-shadow focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25"
              placeholder="client@company.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="inv-desc">
              Service description
            </label>
            <input
              id="inv-desc"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25"
              placeholder="e.g. March sprint — payroll facilitation"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="inv-amt">
              Amount (USDC)
            </label>
            <input
              id="inv-amt"
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/25"
              placeholder="1250.00"
            />
          </div>
        </div>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy || !billedTo.trim() || !description.trim() || !amount.trim()}
            onClick={() => void submit()}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FileText className="h-4 w-4" aria-hidden />
            {busy ? "Building PDF…" : "Download invoice PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function BlinkHistoryTable() {
  const { blinks } = useEmployerSession();
  const { mockBlinks } = useDashboardDemo();
  const baseUrl = (process.env.NEXT_PUBLIC_URL ?? "").replace(/\/$/, "");
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const rows = useMemo(() => mergeAndSort(blinks, mockBlinks), [blinks, mockBlinks]);

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
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-6 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Payment History</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Manage your recent payments. Fund pending transactions to activate them for your contractors.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setInvoiceOpen(true)}
          className="inline-flex shrink-0 items-center justify-center gap-2 self-start rounded-full border border-purple-200 bg-purple-50 px-4 py-2.5 text-sm font-semibold text-purple-800 shadow-sm transition-colors hover:bg-purple-100"
        >
          <FileText className="h-4 w-4" aria-hidden />
          Create invoice
        </button>
      </div>

      <InvoiceModal open={invoiceOpen} onClose={() => setInvoiceOpen(false)} />

      {rows.length === 0 ? (
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
          {rows.map(({ row: b, isMock }) => {
            const { dateLine, timeLine } = formatBlinkDateTime(b.createdAt);
            const avatarSrc = dicebearInitialsUrl(b.contractorEmail);
            const canFund = b.status === "PENDING" && !b.escrowTxSig && !isMock;
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
                      {isMock ? (
                        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                          Mock
                        </span>
                      ) : null}
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
                      {!isMock ? (
                        <Link
                          href={`${baseUrl}/blink/${b.id}`}
                          className="text-purple-600 hover:text-purple-800 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          Contractor link
                        </Link>
                      ) : (
                        <span className="text-slate-400">Contractor link (demo)</span>
                      )}
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
