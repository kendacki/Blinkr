"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { LogoMark } from "@/components/marketing/LogoMark";

export type SuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  linkUrl: string;
  amount: string;
  title?: string;
  message?: string;
};

const DEFAULT_TITLE = "Payment Link Ready!";
const DEFAULT_MESSAGE =
  "Your payment link has been created successfully. Send it to your contractor, then head to the History tab to fund it.";

/** Inline SVG success mark (no static raster assets; scales crisply). */
function SuccessMarkIllustration() {
  return (
    <svg
      className="mx-auto h-28 w-28 shrink-0 sm:h-32 sm:w-32"
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id="successModalGrad" x1="18" y1="18" x2="102" y2="102" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <filter id="successModalGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="60" cy="60" r="52" fill="url(#successModalGrad)" filter="url(#successModalGlow)" opacity={0.95} />
      <circle cx="60" cy="60" r="52" fill="url(#successModalGrad)" />
      <path
        d="M38 61.5L54.5 78L84 44"
        stroke="white"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SuccessModal({
  isOpen,
  onClose,
  linkUrl,
  amount,
  title = DEFAULT_TITLE,
  message = DEFAULT_MESSAGE,
}: SuccessModalProps) {
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    if (!isOpen) {
      setCopyState("idle");
      return;
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const copyLink = useCallback(async () => {
    if (!linkUrl) return;
    try {
      await navigator.clipboard.writeText(linkUrl);
      setCopyState("copied");
    } catch {
      setCopyState("idle");
    }
  }, [linkUrl]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="success-modal-title"
        className="font-[var(--font-poppins)] relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200/80 sm:p-8"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <header className="mb-4 flex items-start justify-between gap-4">
          <LogoMark href="/" size={36} />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </header>

        <div className="flex max-h-[min(78vh,640px)] flex-col overflow-y-auto">
          <div className="py-2">
            <SuccessMarkIllustration />
          </div>

          <h2
            id="success-modal-title"
            className="text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-3 text-center text-sm leading-relaxed text-slate-600 sm:text-base">{message}</p>

          <div className="mt-6 rounded-xl bg-purple-50 p-4 ring-1 ring-purple-100/80">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700/90">Amount</p>
            <p className="mt-1 text-lg font-bold tabular-nums text-slate-900 sm:text-xl">
              {amount}
              <span className="ml-1.5 text-base font-semibold text-purple-600">USDC</span>
            </p>
            <p className="mt-3 break-all font-mono text-[11px] leading-snug text-slate-500 sm:text-xs">{linkUrl}</p>
          </div>

          <button
            type="button"
            onClick={() => void copyLink()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/25 transition-colors hover:bg-purple-600"
          >
            {copyState === "copied" ? (
              <>
                <Check className="h-4 w-4 shrink-0" strokeWidth={2.5} aria-hidden />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 shrink-0" aria-hidden />
                Copy Link
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
