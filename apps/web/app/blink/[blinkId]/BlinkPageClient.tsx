"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { LogoMark } from "@/components/marketing/LogoMark";
import { solanaAddressExplorerUrl, solanaTxExplorerUrl } from "@/lib/explorer";

const STATUS_ORDER = ["PENDING", "OPENED", "CLAIMED", "OFFRAMPED"] as const;
type OrderedStatus = (typeof STATUS_ORDER)[number];

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  OPENED: "Opened",
  CLAIMED: "Claimed",
  OFFRAMPED: "Cashed out",
  EXPIRED: "Expired",
  REFUNDED: "Refunded",
};

function ButtonSpinner() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="h-4 w-4 animate-spin text-current"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExternalArrowIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className="h-3.5 w-3.5"
    >
      <path
        d="M7 5h8v8M15 5l-9 9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ClaimStatusPills({ status }: { status: string }) {
  const orderedIdx = STATUS_ORDER.indexOf(status as OrderedStatus);
  const isTerminalBad = status === "REFUNDED" || status === "EXPIRED";
  return (
    <ol
      className="flex flex-wrap gap-1.5 text-[10px] font-semibold uppercase tracking-wide"
      aria-label="Blink progress"
    >
      {STATUS_ORDER.map((step, i) => {
        const reached = !isTerminalBad && orderedIdx >= i;
        const current = !isTerminalBad && orderedIdx === i;
        return (
          <li
            key={step}
            className={`rounded-full px-2.5 py-0.5 transition-colors ${
              reached ? "bg-purple-500 text-white" : "bg-slate-100 text-slate-500"
            } ${current ? "ring-2 ring-purple-300 ring-offset-1 ring-offset-white" : ""}`}
          >
            {step === "OFFRAMPED" ? "Fiat" : STATUS_LABEL[step]}
          </li>
        );
      })}
      {isTerminalBad ? (
        <li className="rounded-full bg-amber-100 px-2.5 py-0.5 text-amber-900">
          {STATUS_LABEL[status]}
        </li>
      ) : null}
    </ol>
  );
}

function WalletCelebrationIllustration() {
  return (
    <svg
      viewBox="0 0 360 240"
      role="img"
      aria-label="Wallet celebration"
      xmlns="http://www.w3.org/2000/svg"
      className="h-40 w-full sm:h-48"
    >
      <defs>
        <linearGradient id="wcg-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="wcg-coin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FDE68A" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <radialGradient id="wcg-bg" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#F5F3FF" />
          <stop offset="100%" stopColor="#FFFFFF" />
        </radialGradient>
      </defs>

      <rect x="0" y="0" width="360" height="240" rx="24" fill="url(#wcg-bg)" />

      <g opacity="0.85">
        <circle cx="56" cy="48" r="6" fill="#C4B5FD" />
        <circle cx="320" cy="44" r="4" fill="#FBBF24" />
        <circle cx="312" cy="180" r="5" fill="#DDD6FE" />
        <circle cx="48" cy="190" r="4" fill="#A855F7" />
        <path
          d="M298 92 L308 92 M303 87 L303 97"
          stroke="#A855F7"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M52 110 L60 110 M56 106 L56 114"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      <g transform="translate(96 76)">
        <rect width="180" height="110" rx="18" fill="#F5F3FF" />
        <rect x="6" y="10" width="180" height="110" rx="18" fill="url(#wcg-card)" />
        <rect x="22" y="32" width="74" height="10" rx="5" fill="white" fillOpacity="0.75" />
        <rect x="22" y="50" width="120" height="8" rx="4" fill="white" fillOpacity="0.45" />
        <rect x="22" y="64" width="60" height="8" rx="4" fill="white" fillOpacity="0.35" />
        <rect x="22" y="88" width="40" height="6" rx="3" fill="white" fillOpacity="0.55" />
      </g>

      <g transform="translate(212 44)">
        <circle cx="36" cy="36" r="34" fill="url(#wcg-coin)" />
        <circle cx="36" cy="36" r="26" fill="#FCD34D" />
        <text
          x="36"
          y="44"
          textAnchor="middle"
          fontFamily="var(--font-poppins), sans-serif"
          fontWeight="700"
          fontSize="22"
          fill="#92400E"
        >
          $
        </text>
      </g>

      <g transform="translate(58 30)">
        <path
          d="M0 20 L8 4 L16 20 L8 36 Z"
          fill="#A855F7"
          opacity="0.85"
        />
      </g>
      <g transform="translate(280 150)">
        <path
          d="M0 14 L6 2 L12 14 L6 26 Z"
          fill="#7C3AED"
          opacity="0.9"
        />
      </g>
    </svg>
  );
}

type BlinkMeta = {
  blinkId: string;
  amountUsdc: string;
  status: string;
  expiresAt: string;
  employerName: string;
  escrowPDA: string | null;
  claimTxSig: string | null;
};

function sessionKey(blinkId: string) {
  return `blinkr_contractor_${blinkId}`;
}

async function readJson<T>(res: Response): Promise<T> {
  const body = (await res.json()) as T & { error?: { message?: string } };
  if (!res.ok) {
    const msg = (body as { error?: { message?: string } }).error?.message ?? res.statusText;
    throw new Error(msg);
  }
  return body as T;
}

/** Matches marketing `SiteHeader` logo placement for every blink claim URL. */
function BlinkClaimShellHeader({ variant }: { variant: "solid" | "glass" }) {
  const bar =
    variant === "glass"
      ? "border-b border-slate-200/70 bg-white/90 backdrop-blur-xl"
      : "border-b border-slate-200/70 bg-white";
  return (
    <header className={bar}>
      <div className="mx-auto flex max-w-6xl items-center justify-start px-4 py-3 sm:px-6 lg:px-8">
        <LogoMark href="/" size={40} priority />
      </div>
    </header>
  );
}

/** Dedupe React Strict Mode double-invoke for the same Stripe return URL. */
const stripeCompleteInflight = new Set<string>();

export function BlinkPageClient({ blinkId }: { blinkId: string }) {
  const [meta, setMeta] = useState<BlinkMeta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [claimSig, setClaimSig] = useState<string | null>(null);

  const explorerEscrow = useMemo(
    () => (meta?.escrowPDA ? solanaAddressExplorerUrl(meta.escrowPDA) : null),
    [meta?.escrowPDA],
  );

  const refreshMeta = useCallback(async () => {
    const res = await fetch(`/api/blinks/${blinkId}`, { cache: "no-store" });
    const body = await readJson<BlinkMeta>(res);
    setMeta(body);
    if (body.claimTxSig) setClaimSig(body.claimTxSig);
    setLoadError(null);
  }, [blinkId]);

  useEffect(() => {
    void refreshMeta().catch((e: Error) => setLoadError(e.message));
  }, [refreshMeta]);

  useEffect(() => {
    const t = typeof window !== "undefined" ? window.sessionStorage.getItem(sessionKey(blinkId)) : null;
    setSessionToken(t);
  }, [blinkId]);

  useEffect(() => {
    if (!meta) return undefined;
    if (["OFFRAMPED", "REFUNDED", "EXPIRED"].includes(meta.status)) return undefined;
    const id = window.setInterval(() => void refreshMeta(), 5000);
    return () => window.clearInterval(id);
  }, [meta, refreshMeta]);

  useEffect(() => {
    if (typeof window === "undefined" || !meta) return;
    const sp = new URLSearchParams(window.location.search);
    const flag = sp.get("offramp");
    if (flag === "cancel") {
      setActionError("Bank setup was cancelled. You can try cash out again when ready.");
      window.history.replaceState({}, "", `/blink/${blinkId}`);
      return;
    }
    if (flag !== "complete") {
      return;
    }

    const sessionId = sp.get("session_id");
    if (!sessionId) {
      setActionError(null);
      window.history.replaceState({}, "", `/blink/${blinkId}`);
      void refreshMeta();
      return;
    }

    if (!sessionToken) {
      return;
    }

    const inflightKey = `${blinkId}:${sessionId}`;
    if (stripeCompleteInflight.has(inflightKey)) {
      return;
    }
    stripeCompleteInflight.add(inflightKey);

    setActionError(null);
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const res = await fetch("/api/offramp/stripe-complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({ blinkId, sessionId }),
        });
        await readJson<{ ok: true }>(res);
      } catch (e) {
        if (!cancelled) {
          setActionError(e instanceof Error ? e.message : "Could not finalize payout");
        }
      } finally {
        stripeCompleteInflight.delete(inflightKey);
        if (!cancelled) {
          setBusy(false);
          window.history.replaceState({}, "", `/blink/${blinkId}`);
          void refreshMeta();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [blinkId, meta, refreshMeta, sessionToken]);

  const persistSession = (token: string) => {
    window.sessionStorage.setItem(sessionKey(blinkId), token);
    setSessionToken(token);
  };

  const sendCode = async () => {
    setActionError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/blinks/${blinkId}/contractor/send-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      await readJson<{ ok: true }>(res);
      setCodeSent(true);
      setCode("");
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not send code");
    } finally {
      setBusy(false);
    }
  };

  const verifyCode = async () => {
    setActionError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/blinks/${blinkId}/contractor/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim().replace(/\D/g, "").slice(0, 6),
        }),
      });
      const out = await readJson<{ sessionToken: string; claimTxSig?: string | null }>(res);
      persistSession(out.sessionToken);
      if (out.claimTxSig) setClaimSig(out.claimTxSig);
      await refreshMeta();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  const runClaim = async () => {
    if (!sessionToken) {
      setActionError("Verify your email with the code first.");
      return;
    }
    setActionError(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/blinks/${blinkId}/claim`, {
        method: "POST",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      const out = await readJson<{ claimTxSig: string; status: string }>(res);
      setClaimSig(out.claimTxSig);
      await refreshMeta();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Claim failed");
    } finally {
      setBusy(false);
    }
  };

  const startStripeCashOut = async () => {
    if (!sessionToken) {
      setActionError("Verify your email with the code first.");
      return;
    }
    setActionError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/offramp/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          blinkId,
          provider: "stripe_sim",
        }),
      });
      const out = await readJson<{ checkoutUrl: string }>(res);
      window.location.href = out.checkoutUrl;
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Could not start cash out");
    } finally {
      setBusy(false);
    }
  };

  if (loadError && !meta) {
    return (
      <div className="min-h-screen bg-slate-50 font-[var(--font-poppins)] text-slate-900">
        <BlinkClaimShellHeader variant="solid" />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            This payment link is unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600">{loadError}</p>
        </main>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="min-h-screen bg-slate-50 font-[var(--font-poppins)] text-slate-900">
        <BlinkClaimShellHeader variant="solid" />
        <main
          className="mx-auto flex max-w-lg items-center justify-center gap-3 px-4 py-16 text-sm text-slate-600"
          role="status"
        >
          <ButtonSpinner />
          Loading payment…
        </main>
      </div>
    );
  }

  const expired = new Date(meta.expiresAt).getTime() < Date.now();
  /** Stops email / claim flow (but CLAIMED still shows cash-out). */
  const claimFlowDone = ["CLAIMED", "OFFRAMPED", "REFUNDED", "EXPIRED"].includes(meta.status);
  const codeDigits = code.replace(/\D/g, "").slice(0, 6);
  const claimTxLink = (claimSig ?? meta.claimTxSig)
    ? solanaTxExplorerUrl((claimSig ?? meta.claimTxSig) as string)
    : null;
  const onchainViewUrl = claimTxLink ?? explorerEscrow;

  return (
    <div className="min-h-screen bg-slate-50 font-[var(--font-poppins)] text-slate-900">
      <BlinkClaimShellHeader variant="glass" />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        <div className="grid gap-6 md:grid-cols-2 md:items-start">
          {/* Card 1 — Payment Summary */}
          <section className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
            <div className="bg-gradient-to-br from-purple-50 to-white px-6 pb-2 pt-6 sm:px-8">
              <ClaimStatusPills status={meta.status} />
            </div>

            <div className="flex justify-center bg-gradient-to-br from-purple-50 to-white px-6 pb-2 sm:px-8">
              <WalletCelebrationIllustration />
            </div>

            <div className="px-6 pb-8 pt-2 sm:px-8">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Your payment is ready!
              </h1>

              <div className="mt-6 rounded-2xl bg-slate-50 px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Amount
                </p>
                <p className="mt-1 flex items-baseline gap-2 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                  {meta.amountUsdc}
                  <span className="text-base font-semibold text-purple-600">USDC</span>
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Expires{" "}
                  <span className="font-medium text-slate-700">
                    {new Date(meta.expiresAt).toLocaleString()}
                  </span>
                </p>
              </div>

              {meta.escrowPDA ? (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3">
                  <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-600">
                    <span
                      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
                      aria-hidden="true"
                    >
                      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
                        <path
                          d="M5 10l3 3 7-7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    Secured on-chain
                  </span>
                  {onchainViewUrl ? (
                    <a
                      href={onchainViewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 transition-colors hover:text-purple-700"
                    >
                      View transaction details
                      <ExternalArrowIcon />
                    </a>
                  ) : null}
                </div>
              ) : null}

              {expired && !claimFlowDone ? (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  This payment link has expired. Contact the employer if you still need to be
                  paid.
                </p>
              ) : null}

              {claimFlowDone ? (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {meta.status === "CLAIMED" ? (
                    <p>
                      USDC has been claimed to your Blinkr wallet on devnet. You can simulate
                      moving it to a bank with Stripe test mode below (no real money).
                    </p>
                  ) : null}
                  {meta.status === "OFFRAMPED" ? (
                    <p>
                      Simulated bank payout finished. For newer wallets we sweep devnet USDC into
                      the platform treasury; if this Blink used a legacy claim address we could
                      not sign on-chain, your USDC may still show at that address in a block
                      explorer even though this Blink is marked complete here.
                    </p>
                  ) : null}
                  {meta.status !== "CLAIMED" && meta.status !== "OFFRAMPED" ? (
                    <p>This payment is complete ({meta.status}).</p>
                  ) : null}
                  {claimTxLink ? (
                    <p className="mt-2">
                      <a
                        href={claimTxLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 transition-colors hover:text-purple-700"
                      >
                        View claim transaction
                        <ExternalArrowIcon />
                      </a>
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </section>

          {/* Card 2 — Action / Verification */}
          <div className="flex flex-col gap-6">
            {!claimFlowDone && !expired ? (
              <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Verify to claim
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Enter your email to securely claim your funds. No downloads or apps required.
                </p>

                <label
                  className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  htmlFor="em"
                >
                  Email
                </label>
                <input
                  id="em"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-shadow focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                  placeholder="you@company.com"
                />

                <button
                  type="button"
                  disabled={busy || !email.trim()}
                  onClick={() => void sendCode()}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-500 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-px hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {busy ? (
                    <>
                      <ButtonSpinner />
                      Working…
                    </>
                  ) : codeSent ? (
                    "Resend code"
                  ) : (
                    "Request Code"
                  )}
                </button>
              </section>
            ) : null}

            {codeSent && !claimFlowDone && !expired ? (
              <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Enter the code
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Check your inbox for a 6-digit code. It expires in ten minutes.
                </p>
                <label
                  className="mt-6 block text-xs font-semibold uppercase tracking-wide text-slate-500"
                  htmlFor="otp"
                >
                  Code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={codeDigits}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-center font-mono text-lg tracking-[0.4em] text-slate-900 outline-none transition-shadow focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                  placeholder="000000"
                />
                <button
                  type="button"
                  disabled={busy || codeDigits.length !== 6}
                  onClick={() => void verifyCode()}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full border border-purple-200 bg-white py-3 text-sm font-semibold text-purple-700 transition-all hover:-translate-y-px hover:border-purple-500 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {busy ? (
                    <>
                      <ButtonSpinner />
                      Verifying…
                    </>
                  ) : (
                    "Verify and continue"
                  )}
                </button>
              </section>
            ) : null}

            {meta.status === "OPENED" && sessionToken && !claimFlowDone && !expired ? (
              <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Claim your USDC
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Almost there! Submitting your claim. Please keep this tab open until it&apos;s
                  confirmed.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runClaim()}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-500 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-px hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {busy ? (
                    <>
                      <ButtonSpinner />
                      Submitting claim…
                    </>
                  ) : (
                    "Claim to my Blinkr wallet"
                  )}
                </button>
              </section>
            ) : null}

            {meta.status === "OPENED" && !sessionToken && !claimFlowDone && !expired ? (
              <p className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
                Signed in on another device? Enter your email, request a new code, and verify
                again to refresh your session.
              </p>
            ) : null}

            {meta.status === "CLAIMED" && sessionToken ? (
              <section className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-xl font-semibold tracking-tight text-slate-900">
                  Cash out to bank (demo)
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Opens Stripe Checkout in <strong>setup mode</strong> (test cards only). After
                  you finish, we move your devnet USDC from this Blink&apos;s wallet to the
                  treasury so your on-chain balance clears — this is a simulation, not a real
                  bank transfer of USDC.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void startStripeCashOut()}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-purple-500 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-px hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  {busy ? (
                    <>
                      <ButtonSpinner />
                      Starting…
                    </>
                  ) : (
                    "Start Stripe cash-out simulation"
                  )}
                </button>
              </section>
            ) : null}

            {actionError ? (
              <p
                className="rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800"
                role="alert"
              >
                {actionError}
              </p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
