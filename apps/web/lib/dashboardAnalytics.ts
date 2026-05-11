import Decimal from "decimal.js";
import type { BlinkRow } from "@/components/dashboard/EmployerSession";

export type DashboardTransaction = {
  id: string;
  status: string;
  amountUsdc: Decimal;
  contractorEmail: string;
  createdAt: string;
  claimedAt: string | null;
  escrowTxSig: string | null;
  claimTxSig: string | null;
};

export type DateRange = {
  from: Date;
  to: Date;
};

export type SparkPoint = { x: number; y: number };

export type MonthlyVolumePoint = {
  month: string;
  current: number;
  previous: number;
};

export type RecentPayee = {
  id: string;
  name: string;
  email: string;
};

export type WeeklyActivityPoint = {
  day: string;
  send: number;
  receive: number;
};

export type DateRangePreset = "last30" | "last90" | "ytd" | "all" | "thisMonth";

export function parseAmountUsdc(raw: string): Decimal {
  try {
    return new Decimal(raw || "0");
  } catch {
    return new Decimal(0);
  }
}

export function mapBlinkToTransaction(b: BlinkRow): DashboardTransaction {
  return {
    id: b.id,
    status: b.status,
    amountUsdc: parseAmountUsdc(b.amountUsdc),
    contractorEmail: b.contractorEmail,
    createdAt: b.createdAt,
    claimedAt: b.claimedAt ?? null,
    escrowTxSig: b.escrowTxSig,
    claimTxSig: b.claimTxSig,
  };
}

/** Schema has no `FUNDED` — treat funded as escrow transaction present on-chain. */
export function isFunded(tx: DashboardTransaction): boolean {
  return Boolean(tx.escrowTxSig);
}

export function isPendingAwaitingFund(tx: DashboardTransaction): boolean {
  return tx.status === "PENDING" && !tx.escrowTxSig;
}

export function formatUsd2(amount: Decimal): string {
  const n = amount.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

export function formatThousandsK(amount: Decimal): number {
  return amount.div(1000).toDecimalPlaces(3, Decimal.ROUND_HALF_UP).toNumber();
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function defaultDateRange(): DateRange {
  const to = endOfDay(new Date());
  const from = startOfDay(new Date(to));
  from.setDate(from.getDate() - 89);
  return { from, to };
}

export function formatRangeLabel(range: DateRange): string {
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" };
  const a = range.from.toLocaleDateString("en-US", opts);
  const b = range.to.toLocaleDateString("en-US", opts);
  if (a === b) return a;
  return `${a} – ${b}`;
}

export function filterTransactionsByRange(
  txs: DashboardTransaction[],
  range: DateRange
): DashboardTransaction[] {
  const lo = range.from.getTime();
  const hi = range.to.getTime();
  return txs.filter((tx) => {
    const t = new Date(tx.createdAt).getTime();
    return t >= lo && t <= hi;
  });
}

export function sumAmount(txs: DashboardTransaction[]): Decimal {
  return txs.reduce((acc, tx) => acc.plus(tx.amountUsdc), new Decimal(0));
}

export function totalFundedVolume(txs: DashboardTransaction[]): Decimal {
  return sumAmount(txs.filter(isFunded));
}

export function totalPendingEscrowAmount(txs: DashboardTransaction[]): Decimal {
  return sumAmount(txs.filter((tx) => tx.status === "PENDING"));
}

export function totalPendingAwaitingVolume(txs: DashboardTransaction[]): Decimal {
  return sumAmount(txs.filter(isPendingAwaitingFund));
}

export function countPendingAwaitingFund(txs: DashboardTransaction[]): number {
  return txs.filter(isPendingAwaitingFund).length;
}

export function uniqueContractorCount(txs: DashboardTransaction[]): number {
  return new Set(txs.map((t) => t.contractorEmail.toLowerCase())).size;
}

export function donutFundedPercent(funded: Decimal, pendingAwaiting: Decimal): number {
  const denom = funded.plus(pendingAwaiting);
  if (denom.isZero()) return 0;
  return funded.div(denom).times(100).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).toNumber();
}

function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  return `${y}-${m}`;
}

export function eachMonthInRange(from: Date, to: Date): Date[] {
  let a = new Date(from);
  let b = new Date(to);
  if (a > b) {
    const t = a;
    a = b;
    b = t;
  }
  const months: Date[] = [];
  const cur = new Date(a.getFullYear(), a.getMonth(), 1);
  const end = new Date(b.getFullYear(), b.getMonth(), 1);
  while (cur <= end && months.length < 18) {
    months.push(new Date(cur));
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

export function buildMonthlyVolumePoints(
  filtered: DashboardTransaction[],
  range: DateRange
): MonthlyVolumePoint[] {
  const months = eachMonthInRange(range.from, range.to);
  if (months.length === 0) return [];

  const byMonthFunded = new Map<string, Decimal>();
  const byMonthPending = new Map<string, Decimal>();

  for (const tx of filtered) {
    const d = new Date(tx.createdAt);
    const key = monthKey(d);
    if (isFunded(tx)) {
      byMonthFunded.set(key, (byMonthFunded.get(key) ?? new Decimal(0)).plus(tx.amountUsdc));
    }
    if (isPendingAwaitingFund(tx)) {
      byMonthPending.set(key, (byMonthPending.get(key) ?? new Decimal(0)).plus(tx.amountUsdc));
    }
  }

  return months.map((m) => {
    const key = monthKey(m);
    const funded = (byMonthFunded.get(key) ?? new Decimal(0))
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber();
    const pending = (byMonthPending.get(key) ?? new Decimal(0))
      .toDecimalPlaces(2, Decimal.ROUND_HALF_UP)
      .toNumber();
    // Unique label per bucket (avoids duplicate "Jan" across years breaking Recharts categories)
    const month = m.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
    return {
      month,
      current: funded,
      previous: pending,
    };
  });
}

export function buildLast7DaySpark(
  filtered: DashboardTransaction[],
  range: DateRange,
  mode: "pendingAmountCreated" | "distinctContractors"
): SparkPoint[] {
  const end = endOfDay(new Date(Math.min(range.to.getTime(), Date.now())));
  const points: SparkPoint[] = [];
  for (let i = 6; i >= 0; i -= 1) {
    const day = new Date(end);
    day.setDate(day.getDate() - i);
    const dayStart = startOfDay(day).getTime();
    const dayEnd = endOfDay(day).getTime();
    if (dayEnd < range.from.getTime() || dayStart > range.to.getTime()) {
      points.push({ x: 7 - i, y: 0 });
      continue;
    }
    let y = 0;
    if (mode === "pendingAmountCreated") {
      const sum = filtered
        .filter((tx) => {
          if (tx.status !== "PENDING") return false;
          const t = new Date(tx.createdAt).getTime();
          return t >= dayStart && t <= dayEnd;
        })
        .reduce((acc, tx) => acc.plus(tx.amountUsdc), new Decimal(0));
      y = sum.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber();
    } else {
      const set = new Set(
        filtered
          .filter((tx) => {
            const t = new Date(tx.createdAt).getTime();
            return t >= dayStart && t <= dayEnd;
          })
          .map((tx) => tx.contractorEmail.toLowerCase())
      );
      y = set.size;
    }
    points.push({ x: 7 - i, y });
  }
  return points;
}

function startOfWeekMonday(d: Date): Date {
  const x = startOfDay(d);
  const dow = x.getDay();
  const offset = (dow + 6) % 7;
  x.setDate(x.getDate() - offset);
  return x;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function buildWeeklyActivity(
  filtered: DashboardTransaction[],
  range: DateRange
): WeeklyActivityPoint[] {
  const anchor = new Date(Math.min(range.to.getTime(), Date.now()));
  const weekStart = startOfWeekMonday(anchor);
  const points: WeeklyActivityPoint[] = [];
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(weekStart);
    day.setDate(day.getDate() + i);
    const dayStart = startOfDay(day).getTime();
    const dayEnd = endOfDay(day).getTime();
    let sendD = new Decimal(0);
    let receiveD = new Decimal(0);
    for (const tx of filtered) {
      const cAt = new Date(tx.createdAt).getTime();
      if (cAt >= dayStart && cAt <= dayEnd) {
        sendD = sendD.plus(tx.amountUsdc);
      }
      if (tx.claimedAt) {
        const cl = new Date(tx.claimedAt).getTime();
        if (cl >= dayStart && cl <= dayEnd) {
          receiveD = receiveD.plus(tx.amountUsdc);
        }
      }
    }
    points.push({
      day: DAY_LABELS[i] ?? `D${i}`,
      send: sendD.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
      receive: receiveD.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toNumber(),
    });
  }
  return points;
}

export function buildRecentPayees(filtered: DashboardTransaction[]): {
  payees: RecentPayee[];
  extraCount: number;
} {
  const byEmail = new Map<string, { email: string; last: string }>();
  for (const tx of filtered) {
    const key = tx.contractorEmail.toLowerCase();
    const prev = byEmail.get(key);
    if (!prev || new Date(tx.createdAt) > new Date(prev.last)) {
      byEmail.set(key, { email: tx.contractorEmail, last: tx.createdAt });
    }
  }
  const sorted = [...byEmail.values()].sort(
    (a, b) => new Date(b.last).getTime() - new Date(a.last).getTime()
  );
  const top = sorted.slice(0, 5);
  const payees: RecentPayee[] = top.map((p) => ({
    id: p.email,
    name: p.email.split("@")[0]?.replace(/\./g, " ") ?? p.email,
    email: p.email,
  }));
  return { payees, extraCount: Math.max(0, sorted.length - payees.length) };
}

export function buildPayeeStats(filtered: DashboardTransaction[]): {
  sendUsdc: string;
  receiveUsdc: string;
  totalUsdc: string;
} {
  const funded = filtered.filter(isFunded);
  const claimed = filtered.filter((tx) => Boolean(tx.claimedAt));
  const total = sumAmount(filtered);
  return {
    sendUsdc: formatUsd2(sumAmount(funded)),
    receiveUsdc: formatUsd2(sumAmount(claimed)),
    totalUsdc: formatUsd2(total),
  };
}

export function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function transactionsToCsv(filtered: DashboardTransaction[]): string {
  const header = ["Date", "Contractor", "Amount", "Status", "TxHash"];
  const rows = filtered.map((tx) => {
    const date = tx.createdAt.slice(0, 10);
    const txHash = tx.escrowTxSig || tx.claimTxSig || "";
    const amount = tx.amountUsdc.toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toFixed(2);
    return [date, tx.contractorEmail, amount, tx.status, txHash].map(escapeCsvCell).join(",");
  });
  return [header.join(","), ...rows].join("\n");
}

export function applyDatePreset(preset: DateRangePreset): DateRange {
  const now = new Date();
  const to = endOfDay(now);
  switch (preset) {
    case "last30": {
      const from = startOfDay(new Date(to));
      from.setDate(from.getDate() - 29);
      return { from, to };
    }
    case "last90": {
      const from = startOfDay(new Date(to));
      from.setDate(from.getDate() - 89);
      return { from, to };
    }
    case "thisMonth": {
      const from = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1));
      return { from, to };
    }
    case "ytd": {
      const from = startOfDay(new Date(now.getFullYear(), 0, 1));
      return { from, to };
    }
    case "all":
    default: {
      return { from: startOfDay(new Date(2020, 0, 1)), to };
    }
  }
}
