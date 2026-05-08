"use client";

import { useState } from "react";
import { useEmployerSession } from "@/components/dashboard/EmployerSession";

export default function PayrollPage() {
  const { jwt, wallet, loading, error, notice, setError, setNotice, refresh } = useEmployerSession();
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sending, setSending] = useState(false);
  const [lastBlinkId, setLastBlinkId] = useState<string | null>(null);
  const [lastContractorEmail, setLastContractorEmail] = useState<string | null>(null);

  const createBlink = async () => {
    if (!jwt || !wallet) return;
    setError(null);
    setNotice(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/blinks/create", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({
          employerWallet: wallet,
          contractorEmail: email.trim(),
          amountUsdc: amount.trim(),
        }),
      });
      const body = (await res.json()) as { blinkId?: string; blinkUrl?: string; error?: { message?: string } };
      if (!res.ok) throw new Error(body.error?.message ?? "Create Blink failed");
      const createdBlinkId = body.blinkId ?? null;
      setLastBlinkId(createdBlinkId);
      setLastContractorEmail(email.trim() || null);
      setEmail("");
      setAmount("");
      await refresh();
      if (body.blinkUrl) {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(body.blinkUrl);
          setNotice(`Blink created. Contractor link copied:\n${body.blinkUrl}`);
        } else {
          setNotice(`Blink created. Share this link:\n${body.blinkUrl}`);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setSubmitting(false);
    }
  };

  const sendBlinkLinkEmail = async () => {
    if (!jwt || !wallet || !lastBlinkId) return;
    setError(null);
    setNotice(null);
    setSending(true);
    try {
      const res = await fetch(`/api/blinks/${lastBlinkId}/send-link?employerWallet=${encodeURIComponent(wallet)}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const body = (await res.json()) as { sent?: boolean; to?: string; error?: { message?: string } };
      if (!res.ok) throw new Error(body.error?.message ?? "Send email failed");
      setNotice(`Sent Blink link to ${body.to ?? lastContractorEmail ?? "receiver"}.`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Send email failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-4 whitespace-pre-wrap rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {notice}
        </p>
      )}

      {jwt ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold">Create payroll Blink</h2>
          <p className="mt-1 text-sm text-slate-600">
            Creates the database row and escrow PDA. Next, open <strong>History</strong> and click{" "}
            <strong>Fund escrow</strong> to sign <code className="text-xs">create_escrow</code> with Phantom (locks
            USDC on-chain).
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="ce">
                Contractor email
              </label>
              <input
                id="ce"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blinkr"
                placeholder="payee@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase text-slate-500" htmlFor="amt">
                Amount (USDC)
              </label>
              <input
                id="amt"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blinkr"
                placeholder="100.00"
              />
            </div>
          </div>
          <button
            type="button"
            disabled={submitting || loading || !email.trim() || !amount.trim()}
            onClick={() => void createBlink()}
            className="mt-4 rounded-xl bg-blinkr px-5 py-2.5 text-sm font-semibold text-white hover:bg-blinkr-dark disabled:opacity-50"
          >
            Create Blink
          </button>

          <div className="mt-3">
            <button
              type="button"
              disabled={sending || loading || !lastBlinkId}
              onClick={() => void sendBlinkLinkEmail()}
              className="rounded-xl border border-blinkr bg-white px-5 py-2.5 text-sm font-semibold text-blinkr hover:bg-blinkr/10 disabled:opacity-50"
            >
              Send link to receiver email
            </button>
            {lastBlinkId && (
              <p className="mt-2 text-xs text-slate-600">
                Sends the most recently created Blink link{lastContractorEmail ? ` to ${lastContractorEmail}` : ""}.
              </p>
            )}
          </div>
        </section>
      ) : (
        <p className="text-sm text-slate-600">
          Connect Phantom to sign a short message. The server issues a JWT for creating Blinks and reading balances.
        </p>
      )}
    </>
  );
}
