"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useEmployerSession, type BlinkRow } from "@/components/dashboard/EmployerSession";
import {
  applyDatePreset,
  buildLast7DaySpark,
  buildMonthlyVolumePoints,
  buildPayeeStats,
  buildRecentPayees,
  buildWeeklyActivity,
  countPendingAwaitingFund,
  defaultDateRange,
  donutFundedPercent,
  filterTransactionsByRange,
  formatRangeLabel,
  formatUsd2,
  mapBlinkToTransaction,
  totalFundedVolume,
  totalPendingEscrowAmount,
  totalPendingAwaitingVolume,
  transactionsToCsv,
  uniqueContractorCount,
  type DashboardTransaction,
  type DateRange,
  type DateRangePreset,
  type SparkPoint,
} from "@/lib/dashboardAnalytics";

const DASHBOARD_FETCH_LIMIT = 500;

export type UseDashboardDataResult = {
  transactions: DashboardTransaction[];
  filteredTransactions: DashboardTransaction[];
  dateRange: DateRange;
  setDateRange: (r: DateRange) => void;
  applyPreset: (p: DateRangePreset) => void;
  rangeLabel: string;
  isLoading: boolean;
  isError: boolean;
  errorMessage: string | null;
  refetch: () => Promise<void>;
  monthlyVolume: ReturnType<typeof buildMonthlyVolumePoints>;
  weeklyActivity: ReturnType<typeof buildWeeklyActivity>;
  recentPayees: ReturnType<typeof buildRecentPayees>["payees"];
  extraPayeeCount: number;
  payeeStats: ReturnType<typeof buildPayeeStats>;
  kpis: {
    volume: {
      value: string;
      donutPct: number;
      delta: string;
      spark: SparkPoint[];
    };
    pending: {
      value: string;
      delta: string;
      spark: SparkPoint[];
    };
    contractors: {
      value: string;
      delta: string;
      spark: SparkPoint[];
    };
  };
  handleExportReport: () => void;
};

export function useDashboardData(): UseDashboardDataResult {
  const { jwt } = useEmployerSession();
  const [dateRange, setDateRange] = useState<DateRange>(() => defaultDateRange());
  const [rows, setRows] = useState<BlinkRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const fetchBlinks = useCallback(async (): Promise<void> => {
    if (!jwt) {
      setRows([]);
      setErrorMessage(null);
      setIsLoading(false);
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        `/api/employer/blinks?limit=${DASHBOARD_FETCH_LIMIT}`,
        {
          headers: { Authorization: `Bearer ${jwt}` },
          signal: controller.signal,
          cache: "no-store",
        }
      );
      const body = (await res.json()) as {
        blinks?: BlinkRow[];
        error?: { message?: string };
      };
      if (!res.ok) {
        throw new Error(body.error?.message ?? `Request failed (${res.status})`);
      }
      setRows(body.blinks ?? []);
    } catch (e) {
      if ((e as { name?: string }).name === "AbortError") return;
      setErrorMessage(e instanceof Error ? e.message : "Could not load dashboard data");
    } finally {
      if (abortRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, [jwt]);

  useEffect(() => {
    void fetchBlinks();
    return () => {
      abortRef.current?.abort();
    };
  }, [fetchBlinks]);

  const transactions = useMemo(() => rows.map(mapBlinkToTransaction), [rows]);

  const filteredTransactions = useMemo(
    () => filterTransactionsByRange(transactions, dateRange),
    [transactions, dateRange]
  );

  const rangeLabel = useMemo(() => formatRangeLabel(dateRange), [dateRange]);

  const fundedVol = useMemo(() => totalFundedVolume(filteredTransactions), [filteredTransactions]);
  const pendingVol = useMemo(
    () => totalPendingEscrowAmount(filteredTransactions),
    [filteredTransactions]
  );
  const pendingAwaitingVol = useMemo(
    () => totalPendingAwaitingVolume(filteredTransactions),
    [filteredTransactions]
  );
  const pendingAwaitingCount = useMemo(
    () => countPendingAwaitingFund(filteredTransactions),
    [filteredTransactions]
  );
  const contractors = useMemo(
    () => uniqueContractorCount(filteredTransactions),
    [filteredTransactions]
  );
  const fundedCount = useMemo(
    () => filteredTransactions.filter((t) => Boolean(t.escrowTxSig)).length,
    [filteredTransactions]
  );

  const monthlyVolume = useMemo(
    () => buildMonthlyVolumePoints(filteredTransactions, dateRange),
    [filteredTransactions, dateRange]
  );

  const weeklyActivity = useMemo(
    () => buildWeeklyActivity(filteredTransactions, dateRange),
    [filteredTransactions, dateRange]
  );

  const { payees: recentPayees, extraCount: extraPayeeCount } = useMemo(
    () => buildRecentPayees(filteredTransactions),
    [filteredTransactions]
  );

  const payeeStats = useMemo(() => buildPayeeStats(filteredTransactions), [filteredTransactions]);

  const sparkPending = useMemo(
    () => buildLast7DaySpark(filteredTransactions, dateRange, "pendingAmountCreated"),
    [filteredTransactions, dateRange]
  );

  const sparkContractors = useMemo(
    () => buildLast7DaySpark(filteredTransactions, dateRange, "distinctContractors"),
    [filteredTransactions, dateRange]
  );

  const donutPct = useMemo(
    () => donutFundedPercent(fundedVol, pendingAwaitingVol),
    [fundedVol, pendingAwaitingVol]
  );

  const kpis = useMemo(
    () => ({
      volume: {
        value: formatUsd2(fundedVol),
        donutPct,
        delta: `${fundedCount} funded payment${fundedCount === 1 ? "" : "s"}`,
        spark: [],
      },
      pending: {
        value: formatUsd2(pendingVol),
        delta: `${pendingAwaitingCount} awaiting fund`,
        spark: sparkPending,
      },
      contractors: {
        value: String(contractors),
        delta: `${filteredTransactions.length} payment${filteredTransactions.length === 1 ? "" : "s"} in range`,
        spark: sparkContractors,
      },
    }),
    [
      contractors,
      donutPct,
      filteredTransactions.length,
      fundedCount,
      fundedVol,
      pendingAwaitingCount,
      pendingVol,
      sparkContractors,
      sparkPending,
    ]
  );

  const applyPreset = useCallback((p: DateRangePreset) => {
    setDateRange(applyDatePreset(p));
  }, []);

  const handleExportReport = useCallback(() => {
    const csv = transactionsToCsv(filteredTransactions);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const stamp = new Date().toISOString().slice(0, 10);
    a.download = `blinkr-payroll-export-${stamp}.csv`;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [filteredTransactions]);

  return {
    transactions,
    filteredTransactions,
    dateRange,
    setDateRange,
    applyPreset,
    rangeLabel,
    isLoading,
    isError: Boolean(errorMessage),
    errorMessage,
    refetch: fetchBlinks,
    monthlyVolume,
    weeklyActivity,
    recentPayees,
    extraPayeeCount,
    payeeStats,
    kpis,
    handleExportReport,
  };
}
