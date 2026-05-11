"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, type Variants } from "framer-motion";
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
};

type MonthlyVolumePoint = {
  month: string;
  current: number;
  previous: number;
};

type RecentPayee = {
  id: string;
  name: string;
  email: string;
};

type WeeklyActivityPoint = {
  day: string;
  send: number;
  receive: number;
};

type DashboardData = {
  asOfLabel: string;
  kpis: KpiCardData[];
  monthlyVolume: MonthlyVolumePoint[];
  payeeStats: { sendUsdc: string; receiveUsdc: string; totalUsdc: string };
  recentPayees: RecentPayee[];
  weeklyActivity: WeeklyActivityPoint[];
};

const mockDashboardData: DashboardData = {
  asOfLabel: "6 March 2026",
  kpis: [
    {
      id: "volume",
      label: "Total Payroll Volume",
      rangeLabel: "Mar 2026",
      value: "$12,726.20",
      unit: "USDC",
      delta: { value: "+18.4%", positive: true },
      variant: "donut",
      donutPct: 58,
    },
    {
      id: "pending",
      label: "Pending Escrow",
      rangeLabel: "Mar 2026",
      value: "$2,480.50",
      unit: "USDC",
      delta: { value: "3 awaiting fund", positive: false },
      variant: "spark",
      spark: [
        { x: 1, y: 12 },
        { x: 2, y: 18 },
        { x: 3, y: 15 },
        { x: 4, y: 22 },
        { x: 5, y: 19 },
        { x: 6, y: 28 },
        { x: 7, y: 24 },
      ],
    },
    {
      id: "contractors",
      label: "Active Contractors",
      rangeLabel: "Mar 2026",
      value: "18",
      delta: { value: "+2 this week", positive: true },
      variant: "spark",
      spark: [
        { x: 1, y: 10 },
        { x: 2, y: 12 },
        { x: 3, y: 11 },
        { x: 4, y: 14 },
        { x: 5, y: 15 },
        { x: 6, y: 17 },
        { x: 7, y: 18 },
      ],
    },
  ],
  monthlyVolume: [
    { month: "Jan", current: 22, previous: 14 },
    { month: "Feb", current: 28, previous: 18 },
    { month: "Mar", current: 17, previous: 12 },
    { month: "Apr", current: 41, previous: 24 },
    { month: "May", current: 36, previous: 22 },
    { month: "Jun", current: 33, previous: 27 },
    { month: "Jul", current: 38, previous: 30 },
    { month: "Aug", current: 12, previous: 14 },
  ],
  payeeStats: {
    sendUsdc: "$42,938",
    receiveUsdc: "$69,372",
    totalUsdc: "$112,310",
  },
  recentPayees: [
    { id: "p1", name: "Ada Lovelace", email: "ada@example.com" },
    { id: "p2", name: "Satoshi N", email: "sat@example.com" },
    { id: "p3", name: "Grace Hopper", email: "grace@example.com" },
    { id: "p4", name: "Kendrick A", email: "ken@example.com" },
    { id: "p5", name: "Maya Lin", email: "maya@example.com" },
  ],
  weeklyActivity: [
    { day: "Mon", send: 14, receive: 22 },
    { day: "Tue", send: 18, receive: 26 },
    { day: "Wed", send: 9, receive: 12 },
    { day: "Thu", send: 22, receive: 30 },
    { day: "Fri", send: 12, receive: 19 },
    { day: "Sat", send: 16, receive: 24 },
    { day: "Sun", send: 8, receive: 11 },
  ],
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

function avatarUrl(name: string) {
  const params = new URLSearchParams({
    name,
    background: "A855F7",
    color: "fff",
    bold: "true",
    size: "128",
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

function KpiCard({ kpi }: { kpi: KpiCardData }) {
  const donutData = useMemo(
    () => [{ name: kpi.id, value: kpi.donutPct ?? 0, fill: PURPLE_DEEP }],
    [kpi.id, kpi.donutPct]
  );

  return (
    <motion.article
      variants={itemVariants}
      className="relative flex flex-col gap-5 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
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
        </span>
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

function MonthlyVolumeChart({ data }: { data: MonthlyVolumePoint[] }) {
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
        {[
          { d: "M5 3h7l3 3v11H5z" },
          { d: "M4 6h12v8H4z M4 6c0-1 1-2 2-2h8c1 0 2 1 2 2" },
          { d: "M4 5h12v10H4z M8 8h4v4H8z" },
          { d: "M5 4l4 4 4-4M5 16l4-4 4 4" },
          { d: "M4 6h12M4 10h12M4 14h7" },
        ].map((icon, i) => (
          <button
            key={i}
            type="button"
            aria-label={`Quick action ${i + 1}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-purple-300 hover:text-purple-600"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
              <path d={icon.d} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-full border border-purple-100 bg-purple-50/40 px-4 py-2 text-sm text-slate-700">
        <span className="text-base text-purple-600" aria-hidden="true">
          ✦
        </span>
        <p>
          Display the <span className="font-medium text-purple-600">earnings report</span> for the{" "}
          <span className="font-medium text-purple-600">present quarter</span> and produce a{" "}
          <span className="font-medium text-purple-600">financial statement</span>.
        </p>
      </div>

      <div className="mt-5 h-64 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={6} barCategoryGap={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F6" vertical={false} />
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
            />
            <YAxis
              orientation="right"
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `$${v}k`}
              tick={{ fill: "#94A3B8", fontSize: 11 }}
              width={36}
            />
            <Tooltip
              cursor={{ fill: "rgba(168, 85, 247, 0.06)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                fontSize: 12,
                fontFamily: "var(--font-poppins)",
              }}
              formatter={(value) => [`$${Number(value) || 0}k USDC`, ""]}
            />
            <Bar dataKey="previous" radius={[8, 8, 8, 8]} fill={PURPLE_SOFT} />
            <Bar dataKey="current" radius={[8, 8, 8, 8]} fill={PURPLE} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

function RecentPayeesCard({
  payees,
  stats,
}: {
  payees: RecentPayee[];
  stats: DashboardData["payeeStats"];
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

      <div className="mt-5 flex items-center -space-x-3">
        {payees.map((payee) => (
          <Image
            key={payee.id}
            src={avatarUrl(payee.name)}
            alt={payee.name}
            width={44}
            height={44}
            className="h-11 w-11 rounded-full border-2 border-white object-cover shadow-sm"
          />
        ))}
        <span className="ml-3 inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white bg-slate-100 text-xs font-semibold text-slate-600 shadow-sm">
          +12
        </span>
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

function WeeklyActivityCard({ data }: { data: WeeklyActivityPoint[] }) {
  return (
    <motion.section
      variants={itemVariants}
      className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm sm:p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-slate-900">Weekly Escrow Activity</h3>
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
              tick={{ fill: "#94A3B8", fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(168, 85, 247, 0.06)" }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                fontSize: 12,
                fontFamily: "var(--font-poppins)",
              }}
            />
            <Bar dataKey="send" radius={[10, 10, 10, 10]} fill={PURPLE_SOFT} />
            <Bar dataKey="receive" radius={[10, 10, 10, 10]} fill={PURPLE} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.section>
  );
}

export function PayrollAnalyticsDashboard({
  data = mockDashboardData,
}: {
  data?: DashboardData;
}) {
  const [rangeOpen, setRangeOpen] = useState(false);

  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="mb-8"
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
            Overseeing payroll operations and contractor payouts at a glance.
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
            onClick={() => setRangeOpen((v) => !v)}
            aria-expanded={rangeOpen}
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
            {data.asOfLabel}
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
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-purple-300 hover:text-purple-700"
          >
            Export Report
          </button>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-12">
        <div className="flex flex-col gap-5 md:col-span-12 lg:col-span-4">
          {data.kpis.map((kpi) => (
            <KpiCard key={kpi.id} kpi={kpi} />
          ))}
        </div>

        <div className="md:col-span-12 lg:col-span-8">
          <MonthlyVolumeChart data={data.monthlyVolume} />
        </div>

        <div className="md:col-span-12 lg:col-span-6">
          <RecentPayeesCard payees={data.recentPayees} stats={data.payeeStats} />
        </div>

        <div className="md:col-span-12 lg:col-span-6">
          <WeeklyActivityCard data={data.weeklyActivity} />
        </div>
      </div>
    </motion.section>
  );
}
