"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BlinkStatusBar } from "@/components/product/BlinkStatusBar";
import { solanaAddressExplorerUrl, solanaTxExplorerUrl } from "@/lib/explorer";

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
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-slate-900">This Blink is unavailable</h1>
        <p className="mt-2 text-sm text-slate-600">{loadError}</p>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center text-sm text-slate-600" role="status">
        Loading Blink…
      </div>
    );
  }

  const expired = new Date(meta.expiresAt).getTime() < Date.now();
  /** Stops email / claim flow (but CLAIMED still shows cash-out). */
  const claimFlowDone = ["CLAIMED", "OFFRAMPED", "REFUNDED", "EXPIRED"].includes(meta.status);
  const codeDigits = code.replace(/\D/g, "").slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <span className="text-sm font-semibold text-blinkr">Blinkr</span>
          <span className="text-xs text-slate-500">Contractor claim</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-8">
        <BlinkStatusBar status={meta.status} />

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-bold tracking-tight">Payment for you</h1>
          <p className="mt-1 text-sm text-slate-600">
            From <span className="font-medium text-slate-800">{meta.employerName}</span>
          </p>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between gap-4 border-t border-slate-100 pt-3">
              <dt className="text-slate-500">Amount</dt>
              <dd className="font-semibold tabular-nums">{meta.amountUsdc} USDC</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-slate-500">Expires</dt>
              <dd className="text-right">{new Date(meta.expiresAt).toLocaleString()}</dd>
            </div>
            {meta.escrowPDA && (
              <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
                <dt className="text-slate-500">Escrow (on-chain)</dt>
                <dd className="break-all font-mono text-xs text-slate-700">{meta.escrowPDA}</dd>
                {explorerEscrow && (
                  <a
                    href={explorerEscrow}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-medium text-blinkr hover:underline"
                  >
                    View on Solana Explorer
                  </a>
                )}
              </div>
            )}
          </dl>
        </section>

        {expired && !claimFlowDone && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This Blink has expired. Contact the employer if you still need to be paid.
          </p>
        )}

        {claimFlowDone && (
          <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-800">
            {meta.status === "CLAIMED" && (
              <p>
                USDC has been claimed to your Blinkr wallet on devnet. You can simulate moving it to a bank with Stripe
                test mode below (no real money).
              </p>
            )}
            {meta.status === "OFFRAMPED" && (
              <p>
                Simulated bank payout finished. For newer wallets we sweep devnet USDC into the platform treasury; if
                this Blink used a legacy claim address we could not sign on-chain, your USDC may still show at that
                address in a block explorer even though this Blink is marked complete here.
              </p>
            )}
            {meta.status !== "CLAIMED" && meta.status !== "OFFRAMPED" && (
              <p>This Blink is complete ({meta.status}).</p>
            )}
            {(claimSig ?? meta.claimTxSig) && (
              <p className="mt-2">
                <a
                  href={solanaTxExplorerUrl((claimSig ?? meta.claimTxSig) as string)}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-blinkr hover:underline"
                >
                  View claim transaction
                </a>
              </p>
            )}
          </div>
        )}

        {meta.status === "CLAIMED" && sessionToken && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Cash out to bank (demo)</h2>
            <p className="mt-1 text-sm text-slate-600">
              Opens Stripe Checkout in <strong>setup mode</strong> (test cards only). After you finish, we move your
              devnet USDC from this Blink&apos;s wallet to the treasury so your on-chain balance clears — this is a
              simulation, not a real bank transfer of USDC.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => void startStripeCashOut()}
              className="mt-4 w-full rounded-xl bg-blinkr py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blinkr-dark disabled:opacity-50"
            >
              {busy ? "Starting…" : "Start Stripe cash-out simulation"}
            </button>
          </section>
        )}

        {!claimFlowDone && !expired && (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Confirm your email</h2>
              <p className="mt-1 text-sm text-slate-600">
                Use the same email the employer entered for this Blink. We will send a short verification code — no app
                install or device biometrics required.
              </p>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="em">
                Email
              </label>
              <input
                id="em"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blinkr focus:ring-2 focus:ring-blinkr/25"
                placeholder="you@company.com"
              />
              <button
                type="button"
                disabled={busy || !email.trim()}
                onClick={() => void sendCode()}
                className="mt-4 w-full rounded-xl bg-blinkr py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blinkr-dark disabled:opacity-50"
              >
                {busy ? "Working…" : codeSent ? "Resend code" : "Email me a code"}
              </button>
            </section>

            {codeSent && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Enter the code</h2>
                <p className="mt-1 text-sm text-slate-600">Check your inbox for a 6-digit code. It expires in ten minutes.</p>
                <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-slate-500" htmlFor="otp">
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
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-lg tracking-widest outline-none focus:border-blinkr focus:ring-2 focus:ring-blinkr/25"
                  placeholder="000000"
                />
                <button
                  type="button"
                  disabled={busy || codeDigits.length !== 6}
                  onClick={() => void verifyCode()}
                  className="mt-4 w-full rounded-xl border border-blinkr bg-blinkr-muted py-3 text-sm font-semibold text-blinkr-dark transition hover:bg-blinkr/20 disabled:opacity-50"
                >
                  {busy ? "Verifying…" : "Verify and continue"}
                </button>
              </section>
            )}

            {meta.status === "OPENED" && sessionToken && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Claim USDC</h2>
                <p className="mt-1 text-sm text-slate-600">
                  Submit the relayer-signed claim transaction. Keep this tab open until confirmation.
                </p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void runClaim()}
                  className="mt-4 w-full rounded-xl border border-blinkr bg-blinkr-muted py-3 text-sm font-semibold text-blinkr-dark transition hover:bg-blinkr/20 disabled:opacity-50"
                >
                  {busy ? "Submitting claim…" : "Claim to my Blinkr wallet"}
                </button>
              </section>
            )}

            {meta.status === "OPENED" && !sessionToken && (
              <p className="text-sm text-slate-600">
                Signed in on another device? Enter your email, request a new code, and verify again to refresh your
                session.
              </p>
            )}
          </>
        )}

        {actionError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
            {actionError}
          </p>
        )}
      </main>
    </div>
  );
}
