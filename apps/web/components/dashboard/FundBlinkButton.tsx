"use client";

import { Connection, Transaction } from "@solana/web3.js";
import { useState } from "react";
import { useEmployerSession } from "@/components/dashboard/EmployerSession";

function txFromBase64(serializedTxBase64: string): Transaction {
  const binary = atob(serializedTxBase64);
  const buf = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    buf[i] = binary.charCodeAt(i);
  }
  return Transaction.from(buf);
}

export function FundBlinkButton({ blinkId }: { blinkId: string }) {
  const { jwt, refresh, rpcUrl, setError } = useEmployerSession();
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!jwt) {
      setError("Sign in first.");
      return;
    }
    const sol = window.solana;
    if (!sol?.signTransaction) {
      setError("Phantom signTransaction is required to fund the escrow.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/blinks/${blinkId}/prepare-fund-tx`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const body = (await res.json()) as {
        serializedTxBase64?: string;
        blockhash?: string;
        lastValidBlockHeight?: number;
        error?: { message?: string };
      };
      if (!res.ok || !body.serializedTxBase64 || !body.blockhash || body.lastValidBlockHeight == null) {
        throw new Error(body.error?.message ?? "Could not build fund transaction");
      }
      const tx = txFromBase64(body.serializedTxBase64);
      const signed = await sol.signTransaction(tx);
      const connection = new Connection(rpcUrl, "confirmed");
      const sig = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });
      await connection.confirmTransaction(
        {
          signature: sig,
          blockhash: body.blockhash,
          lastValidBlockHeight: body.lastValidBlockHeight,
        },
        "confirmed",
      );
      const c = await fetch(`/api/blinks/${blinkId}/confirm-escrow`, {
        method: "POST",
        headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" },
        body: JSON.stringify({ escrowTxSig: sig }),
      });
      const cj = (await c.json()) as { error?: { message?: string } };
      if (!c.ok) throw new Error(cj.error?.message ?? "Could not confirm escrow on the server");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Funding failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      disabled={busy}
      onClick={() => void run()}
      className="inline-flex items-center justify-center rounded-full bg-purple-500 px-3 py-1 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-purple-600 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? "Signing…" : "Fund escrow"}
    </button>
  );
}
