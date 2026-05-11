"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
import Decimal from "decimal.js";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboardData } from "@/hooks/useDashboardData";
import { dicebearInitialsUrl } from "@/lib/blinkDisplayFormat";
import type { DateRangePreset, MonthlyVolumePoint } from "@/lib/dashboardAnalytics";
import { PayrollDashboardSkeleton } from "@/components/dashboard/PayrollDashboardSkeleton";

type SparkPoint = { x: number; y: number };

type KpiCardData = {
  id: string;
  label: string;
  rangeLabel: string;
  value: string;
  unit?: string;
  delta?: { value: string; positive: boolean };
  variant: "donut" | "spark";
  donutPct?: number;
  spark?: SparkPoint[];
  onRangeClick?: () => void;
};

const PURPLE = "#A855F7";
const PURPLE_DEEP = "#7C3AED";
const PURPLE_SOFT = "#E9D5FF";
const PURPLE_TRACK = "#F3E8FF";

const containerVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "last30", label: "Last 30 days" },
  { id: "last90", label: "Last 90 days" },
  { id: "thisMonth", label: "This month" },
  { id: "ytd", label: "Year to date" },
  { id: "all", label: "All time" },
];

const MONTHLY_CHART_Y_TICKS = [0, 100, 1000, 5000, 10000, 50000, 100000] as const;
const MONTHLY_CHART_Y_MAX = 100_000;

/** Tick labels for the bounded monthly volume Y-axis (non-uniform tick spacing, linear domain). */
function formatMonthlyChartYAxisTick(value: number): string {
  const labels: Record<number, string> = {
    0: "$0",
    100: "$100",
    1000: "$1000",
    5000: "$5K",
    10000: "$10K",
    50000: "$50K",
    100000: "$100K",
  };
  return labels[value] ?? `$${value}`;
}

function formatUsdTooltip(value: number | undefined, name: string) {
  const v = Number(value) || 0;
  const label = name.includes("Funded") ? "Funded" : "Not funded yet";
  return [
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v),
    label,
  ];
}

function KpiCard({ kpi }: { kpi: KpiCardData }) {
  const donutData = useMemo(
    () => [{ name: kpi.id, value: Math.min(100, Math.max(0, kpi.donutPct ?? 0)), fill: PURPLE_DEEP }],
    [kpi.id, kpi.donutPct]
  );

  return (
    <motion.article
      variants={itemVariants}
      className="relative flex flex-col gap-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={kpi.onRangeClick}
          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-purple-50 hover:text-purple-700"
        >
          {kpi.rangeLabel}
          <svg viewBox="0 0 20 20" className="h-3 w-3 text-slate-500" fill="none" aria-hidden="true">
            <path
              d="M5 8l5 5 5-5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          aria-label="Expand card"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-purple-300 hover:text-purple-600"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M11 4h5v5M9 16H4v-5M16 4l-6 6M4 16l6-6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{kpi.label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {kpi.value}
            {kpi.unit ? (
              <span className="ml-1 text-xs font-medium text-slate-500">{kpi.unit}</span>
            ) : null}
          </p>
          {kpi.delta ? (
            <p
              className={`mt-1 text-xs font-medium ${
                kpi.delta.positive ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {kpi.delta.value}
            </p>
          ) : null}
        </div>

        <div className="relative h-16 w-20 shrink-0">
          {kpi.variant === "donut" ? (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  innerRadius="70%"
                  outerRadius="100%"
                  data={donutData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar background={{ fill: PURPLE_TRACK }} dataKey="value" cornerRadius={8} />
                </RadialBarChart>
              </ResponsiveContainer>
              <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-purple-700">
                {kpi.donutPct ?? 0}%
              </span>
            </>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={kpi.spark ?? []} barCategoryGap={3}>
                <Bar dataKey="y" radius={[4, 4, 4, 4]}>
                  {(kpi.spark ?? []).map((entry, idx) => (
                    <Cell
                      key={entry.x}
                      fill={idx === (kpi.spark?.length ?? 0) - 1 ? PURPLE_DEEP : PURPLE_SOFT}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </motion.article>
  );
}

function MonthlyVolumeChart({ filteredData }: { filteredData: MonthlyVolumePoint[] }) {
  return (
    <motion.section
      variants={itemVariants}
      className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-purple-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-purple-600"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M10 3l1.7 4.3L16 9l-4.3 1.7L10 15l-1.7-4.3L4 9l4.3-1.7L10 3z"
              fill="currentColor"
            />
          </svg>
          Assistant
        </button>
      </div>

      <div className="mt-4 rounded-full border border-purple-100 bg-purple-50/40 px-4 py-2 text-sm text-slate-700">
        <p>
          Display the <span className="font-medium text-purple-600">earnings report</span> for the
          present quarter and produce a{" "}
          <span className="font-medium text-purple-600">financial statement</span>.
        </p>
      </div>

      <div className="mt-5 h-64 w-full sm:h-72">
        {filteredData.length === 0 ? (
          <div className="flex h-full min-h-[14rem] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 text-center text-sm text-gray-500">
            No transactions found for this period.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredData} barGap={6} barCategoryGap={20}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748B", fontSize: 12, fontFamily: "var(--font-poppins)" }}
              />
              <YAxis
                orientation="right"
                axisLine={false}
                tickLine={false}
                type="number"
                domain={[0, MONTHLY_CHART_Y_MAX]}
                ticks={[...MONTHLY_CHART_Y_TICKS]}
                tickFormatter={formatMonthlyChartYAxisTick}
                tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "var(--font-poppins)" }}
                width={52}
                allowDataOverflow
              />
              <Tooltip
                cursor={{ fill: "rgba(168, 85, 247, 0.06)" }}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                  fontFamily: "var(--font-poppins)",
                }}
                formatter={(value, name) => formatUsdTooltip(value as number, String(name))}
              />
              <Bar
                dataKey="previous"
                name="Not funded yet (USDC)"
                minPointSize={4}
                radius={[4, 4, 0, 0]}
                fill={PURPLE_SOFT}
              />
              <Bar
                dataKey="current"
                name="Funded (USDC)"
                minPointSize={4}
                radius={[4, 4, 0, 0]}
                fill={PURPLE}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </motion.section>
  );
}

function RecentPayeesCard({
  payees,
  stats,
  extraCount,
}: {
  payees: { id: string; name: string; email: string }[];
  stats: { sendUsdc: string; receiveUsdc: string; totalUsdc: string };
  extraCount: number;
}) {
  return (
    <motion.section
      variants={itemVariants}
      className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Recent Payees</h3>
        <button
          type="button"
          aria-label="Edit recent payees"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-purple-300 hover:text-purple-600"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
            <path
              d="M4 14l2-1 7-7 1-1a1.4 1.4 0 012 2l-1 1-7 7-1 2-3 1 1-3z"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className="mt-5 flex min-h-[2.75rem] flex-wrap items-center gap-1 -space-x-3">
        {payees.length === 0 ? (
          <p className="w-full pl-1 text-sm text-slate-500">No payees in this date range.</p>
        ) : (
          payees.map((payee) => (
            <Image
              key={payee.id}
              src={dicebearInitialsUrl(payee.id)}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
              unoptimized
            />
          ))
        )}
        {extraCount > 0 ? (
          <span className="ml-3 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-semibold text-slate-600 shadow-sm">
            +{extraCount}
          </span>
        ) : null}
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Send</dt>
          <dd className="mt-1 font-semibold text-slate-900">{stats.sendUsdc}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Receive</dt>
          <dd className="mt-1 font-semibold text-slate-900">{stats.receiveUsdc}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">All Transactions</dt>
          <dd className="mt-1 font-semibold text-slate-900">{stats.totalUsdc}</dd>
        </div>
      </dl>
    </motion.section>
  );
}

function WeeklyActivityCard({ data }: { data: { day: string; send: number; receive: number }[] }) {
  return (
    <motion.section
      variants={itemVariants}
      className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Weekly Activity</h3>
        <div className="flex items-center gap-3 text-xs">
          <span className="inline-flex items-center gap-1.5 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-purple-200" aria-hidden="true" />
            Send
          </span>
          <span className="inline-flex items-center gap-1.5 text-slate-700">
            <span className="h-2 w-2 rounded-full bg-purple-500" aria-hidden="true" />
            Receive
          </span>
        </div>
      </div>

      <div className="mt-4 h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={4} barCategoryGap={18}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "var(--font-poppins)" }}
            />
            <Tooltip
              cursor={{ fill: "rgba(168, 85, 247, 0.06)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                fontSize: 12,
                fontFamily: "var(--font-poppins)",
              }}
              formatter={(value) =>
                new Intl.NumberFormat("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }).format(Number(value) || 0)
              }
            />
            <Bar dataKey="send" radius={[10, 10, 10, 10]} fill={PURPLE_SOFT} />
            <Bar dataKey="receive" radius={[10, 10, 10, 10]} fill={PURPLE} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

export function PayrollAnalyticsDashboard() {
  const {
    rangeLabel,
    dateRange,
    setDateRange,
    applyPreset,
    isLoading,
    isError,
    errorMessage,
    refetch,
    transactions,
    monthlyVolume,
    weeklyActivity,
    recentPayees,
    extraPayeeCount,
    payeeStats,
    kpis,
    handleExportReport,
  } = useDashboardData();

  const [pickerOpen, setPickerOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");

  useEffect(() => {
    if (!pickerOpen) return;
    const from = dateRange?.from;
    const to = dateRange?.to;
    if (from instanceof Date && !Number.isNaN(from.getTime())) {
      setDraftFrom(from.toISOString().slice(0, 10));
    }
    if (to instanceof Date && !Number.isNaN(to.getTime())) {
      setDraftTo(to.toISOString().slice(0, 10));
    }
  }, [pickerOpen, dateRange?.from, dateRange?.to]);

  const safeKpis = useMemo(
    () =>
      kpis ?? {
        volume: { value: "$0.00", donutPct: 0, delta: "", spark: [] },
        pending: { value: "$0.00", delta: "", spark: [] },
        contractors: { value: "0", delta: "", spark: [] },
      },
    [kpis]
  );
  const safeRangeLabel = rangeLabel ?? "";

  const kpiCards: KpiCardData[] = useMemo(
    () => [
      {
        id: "volume",
        label: "Total Payroll Volume",
        rangeLabel: safeRangeLabel,
        value: safeKpis.volume.value,
        unit: "USDC",
        delta: { value: safeKpis.volume.delta, positive: true },
        variant: "donut",
        donutPct: safeKpis.volume.donutPct,
        spark: safeKpis.volume.spark,
        onRangeClick: () => setPickerOpen(true),
      },
      {
        id: "pending",
        label: "Pending Escrow",
        rangeLabel: safeRangeLabel,
        value: safeKpis.pending.value,
        unit: "USDC",
        delta: {
          value: safeKpis.pending.delta,
          positive: (safeKpis.pending.delta ?? "").startsWith("0 awaiting"),
        },
        variant: "spark",
        spark: safeKpis.pending.spark,
        onRangeClick: () => setPickerOpen(true),
      },
      {
        id: "contractors",
        label: "Active Contractors",
        rangeLabel: safeRangeLabel,
        value: safeKpis.contractors.value,
        delta: { value: safeKpis.contractors.delta, positive: true },
        variant: "spark",
        spark: safeKpis.contractors.spark,
        onRangeClick: () => setPickerOpen(true),
      },
    ],
    [safeKpis, safeRangeLabel]
  );

  const applyDraftRange = useCallback(() => {
    const from = new Date(draftFrom);
    const to = new Date(draftTo);
    if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return;
    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);
    if (from > to) return;
    setDateRange({ from, to });
    setPickerOpen(false);
  }, [draftFrom, draftTo, setDateRange]);

  if (isLoading && (transactions?.length ?? 0) === 0 && !isError) {
    return <PayrollDashboardSkeleton />;
  }

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="mb-8 font-[var(--font-poppins)]"
    >
      <motion.header
        variants={itemVariants}
        className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Payroll Overview
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {`Keep track of your team's payroll and payouts effortlessly.`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label="Search"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:border-purple-300 hover:text-purple-600"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
              <circle cx="9" cy="9" r="5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M13 13l4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-expanded={pickerOpen}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
          >
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500">
              <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                <path
                  d="M4 6h12v10H4z M4 9h12 M8 4v3 M12 4v3"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            {rangeLabel}
            <svg viewBox="0 0 20 20" fill="none" className="h-3 w-3" aria-hidden="true">
              <path
                d="M5 8l5 5 5-5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={handleExportReport}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-purple-300 hover:text-purple-700"
          >
            Export Report
          </button>
        </div>
      </motion.header>

      {isError ? (
        <motion.div
          variants={itemVariants}
          role="alert"
          className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-semibold">Could not load dashboard data</p>
            <p className="text-red-700">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            className="inline-flex items-center justify-center self-start rounded-full border border-red-200 bg-white px-4 py-1.5 text-xs font-semibold text-red-700 transition-colors hover:border-red-300 hover:bg-red-100 sm:self-auto"
          >
            Retry
          </button>
        </motion.div>
      ) : null}

      {pickerOpen ? (
        <motion.div
          variants={itemVariants}
          className="mb-5 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date range</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  applyPreset(p.id);
                  setPickerOpen(false);
                }}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-purple-300 hover:bg-purple-50 hover:text-purple-800"
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
            <label className="flex flex-1 flex-col gap-1 text-xs text-slate-600">
              From
              <input
                type="date"
                value={draftFrom}
                onChange={(e) => setDraftFrom(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-xs text-slate-600">
              To
              <input
                type="date"
                value={draftTo}
                onChange={(e) => setDraftTo(e.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30"
              />
            </label>
            <button
              type="button"
              onClick={() => applyDraftRange()}
              className="rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-purple-600"
            >
              Apply
            </button>
          </div>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        <div className="flex flex-col gap-5 md:col-span-12 lg:col-span-4">
          {kpiCards.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        <div className="md:col-span-12 lg:col-span-8">
          <MonthlyVolumeChart filteredData={monthlyVolume ?? []} />
        </div>

        <div className="md:col-span-12 lg:col-span-6">
          <RecentPayeesCard
            payees={recentPayees ?? []}
            stats={payeeStats ?? { sendUsdc: "$0.00", receiveUsdc: "$0.00", totalUsdc: "$0.00" }}
            extraCount={extraPayeeCount ?? 0}
          />
        </div>

        <div className="md:col-span-12 lg:col-span-6">
          <WeeklyActivityCard data={weeklyActivity ?? []} />
        </div>
      </div>
    </motion.section>
  );
}
