"use client";

import bs58 from "bs58";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type BlinkRow = {
  id: string;
  contractorEmail: string;
  amountUsdc: string;
  status: string;
  escrowPDA: string | null;
  escrowTxSig: string | null;
  claimTxSig: string | null;
  expiresAt: string;
  createdAt: string;
};

const JWT_KEY = "blinkr_employer_jwt";

type EmployerSessionValue = {
  jwt: string | null;
  wallet: string | null;
  balance: string | null;
  blinks: BlinkRow[];
  loading: boolean;
  error: string | null;
  notice: string | null;
  setNotice: (n: string | null) => void;
  setError: (e: string | null) => void;
  connectPhantom: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
  rpcUrl: string;
};

const EmployerSessionContext = createContext<EmployerSessionValue | null>(null);

export function EmployerSessionProvider({ children }: { children: React.ReactNode }) {
  const [jwt, setJwt] = useState<string | null>(null);
  const [wallet, setWallet] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [blinks, setBlinks] = useState<BlinkRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const rpcUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
    [],
  );

  useEffect(() => {
    setJwt(typeof window !== "undefined" ? localStorage.getItem(JWT_KEY) : null);
  }, []);

  const authHeaders = useCallback((): HeadersInit => {
    if (!jwt) return {};
    return { Authorization: `Bearer ${jwt}` };
  }, [jwt]);

  const refresh = useCallback(async () => {
    if (!jwt) {
      setBlinks([]);
      setBalance(null);
      setWallet(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const bRes = await fetch("/api/employer/blinks", { headers: authHeaders() });
      const bJson = (await bRes.json()) as { blinks?: BlinkRow[]; error?: { message?: string } };
      if (!bRes.ok) throw new Error(bJson.error?.message ?? "Could not load Blinks");
      setBlinks(bJson.blinks ?? []);

      const balRes = await fetch("/api/employer/balance", { headers: authHeaders() });
      const balJson = (await balRes.json()) as {
        usdcBalance?: string;
        walletAddress?: string;
        error?: { message?: string };
      };
      if (!balRes.ok) throw new Error(balJson.error?.message ?? "Could not load balance");
      setBalance(balJson.usdcBalance ?? null);
      setWallet(balJson.walletAddress ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, [jwt, authHeaders]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connectPhantom = useCallback(async () => {
    setError(null);
    setNotice(null);
    const sol = window.solana;
    if (!sol?.isPhantom) {
      setError("Phantom wallet not found. Install Phantom for Solana.");
      return;
    }
    setLoading(true);
    try {
      const { publicKey } = await sol.connect();
      const walletAddress =
        typeof (publicKey as { toBase58?: () => string }).toBase58 === "function"
          ? (publicKey as { toBase58: () => string }).toBase58()
          : String(publicKey);
      const message = `Blinkr employer session\nWallet: ${walletAddress}\nTime: ${new Date().toISOString()}`;
      const encoded = new TextEncoder().encode(message);
      const signed = await sol.signMessage(encoded);
      const signatureBase58 = bs58.encode(signed.signature);
      const res = await fetch("/api/auth/employer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress, message, signatureBase58 }),
      });
      const body = (await res.json()) as { token?: string; error?: { message?: string } };
      if (!res.ok || !body.token) throw new Error(body.error?.message ?? "Wallet authentication failed");
      localStorage.setItem(JWT_KEY, body.token);
      setJwt(body.token);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Connection failed");
    } finally {
      setLoading(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    localStorage.removeItem(JWT_KEY);
    setJwt(null);
    setWallet(null);
    setBalance(null);
    setBlinks([]);
    setNotice(null);
  }, []);

  const value: EmployerSessionValue = useMemo(
    () => ({
      jwt,
      wallet,
      balance,
      blinks,
      loading,
      error,
      notice,
      setNotice,
      setError,
      connectPhantom,
      disconnect,
      refresh,
      rpcUrl,
    }),
    [
      jwt,
      wallet,
      balance,
      blinks,
      loading,
      error,
      notice,
      setNotice,
      setError,
      connectPhantom,
      disconnect,
      refresh,
      rpcUrl,
    ],
  );

  return <EmployerSessionContext.Provider value={value}>{children}</EmployerSessionContext.Provider>;
}

export function useEmployerSession(): EmployerSessionValue {
  const ctx = useContext(EmployerSessionContext);
  if (!ctx) {
    throw new Error("useEmployerSession must be used within EmployerSessionProvider");
  }
  return ctx;
}
