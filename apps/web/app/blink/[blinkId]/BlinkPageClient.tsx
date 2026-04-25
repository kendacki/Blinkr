"use client";

import { startAuthentication, startRegistration } from "@simplewebauthn/browser";
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/types";
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

export function BlinkPageClient({ blinkId }: { blinkId: string }) {
  const [meta, setMeta] = useState<BlinkMeta | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
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
    if (["CLAIMED", "OFFRAMPED", "REFUNDED", "EXPIRED"].includes(meta.status)) return undefined;
    const id = window.setInterval(() => void refreshMeta(), 5000);
    return () => window.clearInterval(id);
  }, [meta, refreshMeta]);

  const persistSession = (token: string) => {
    window.sessionStorage.setItem(sessionKey(blinkId), token);
    setSessionToken(token);
  };

  const runPasskey = async () => {
    setActionError(null);
    setBusy(true);
    try {
      const reg = await fetch("/api/passkey/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blinkId, email: email.trim() }),
      });
      const optionsJSON = await readJson<unknown>(reg);
      const isRegistration =
        typeof optionsJSON === "object" &&
        optionsJSON !== null &&
        "user" in (optionsJSON as PublicKeyCredentialCreationOptionsJSON);
      const credential = isRegistration
        ? await startRegistration(optionsJSON as PublicKeyCredentialCreationOptionsJSON)
        : await startAuthentication(optionsJSON as PublicKeyCredentialRequestOptionsJSON);
      const v = await fetch("/api/passkey/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blinkId, credential }),
      });
      const out = await readJson<{ sessionToken: string; claimTxSig?: string | null }>(v);
      persistSession(out.sessionToken);
      if (out.claimTxSig) setClaimSig(out.claimTxSig);
      await refreshMeta();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Passkey flow failed");
    } finally {
      setBusy(false);
    }
  };

  const runClaim = async () => {
    if (!sessionToken) {
      setActionError("Sign in with your passkey first.");
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
  const terminal = ["CLAIMED", "OFFRAMPED", "REFUNDED", "EXPIRED"].includes(meta.status);

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

        {expired && !terminal && (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            This Blink has expired. Contact the employer if you still need to be paid.
          </p>
        )}

        {terminal && (
          <div className="rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-800">
            <p>This Blink is complete ({meta.status}).</p>
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

        {!terminal && !expired && (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">1. Confirm your email</h2>
              <p className="mt-1 text-sm text-slate-600">
                Use the same email the employer entered for this Blink. Your device passkey replaces seed phrases.
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
                onClick={() => void runPasskey()}
                className="mt-4 w-full rounded-xl bg-blinkr py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blinkr-dark disabled:opacity-50"
              >
                {busy ? "Working…" : "2. Continue with passkey"}
              </button>
            </section>

            {meta.status === "OPENED" && sessionToken && (
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">3. Claim USDC</h2>
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
                Passkey verified on another device? Enter your email and run the passkey step again to refresh your
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
