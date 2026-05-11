"use client";

import { useState } from "react";
import { useEmployerSession } from "@/components/dashboard/EmployerSession";
import { DisconnectedWalletState } from "@/components/dashboard/DisconnectedWalletState";

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
        <p
          className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-3 text-sm text-red-800"
          role="alert"
        >
          {error}
        </p>
      )}
      {notice && (
        <p className="mb-5 whitespace-pre-wrap rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm text-emerald-900">
          {notice}
        </p>
      )}

      {jwt ? (
        <section className="rounded-2xl border border-slate-200/70 bg-white p-8 shadow-sm sm:p-10">
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Create a Payment</h2>
          <p className="mt-1 text-sm text-slate-600">
            Set up a new payment link. Once created, head over to the History tab to securely fund
            it.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                htmlFor="ce"
              >
                Contractor email
              </label>
              <input
                id="ce"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-shadow focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                placeholder="payee@example.com"
              />
            </div>
            <div>
              <label
                className="text-xs font-semibold uppercase tracking-wide text-slate-500"
                htmlFor="amt"
              >
                Amount (USDC)
              </label>
              <input
                id="amt"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none transition-shadow focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
                placeholder="100.00"
              />
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={submitting || loading || !email.trim() || !amount.trim()}
              onClick={() => void createBlink()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(15,23,42,0.08)] transition-all hover:-translate-y-px hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {submitting ? "Creating…" : "Create Blink"}
            </button>
            <button
              type="button"
              disabled={sending || loading || !lastBlinkId}
              onClick={() => void sendBlinkLinkEmail()}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-purple-200 bg-white px-6 py-3 text-sm font-semibold text-purple-700 transition-all hover:-translate-y-px hover:border-purple-500 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              {sending ? "Sending…" : "Send link to receiver email"}
            </button>
          </div>
          {lastBlinkId && (
            <p className="mt-3 text-xs text-slate-500">
              Sends the most recently created Blink link
              {lastContractorEmail ? ` to ${lastContractorEmail}` : ""}.
            </p>
          )}
        </section>
      ) : (
        <DisconnectedWalletState />
      )}
    </>
  );
}
