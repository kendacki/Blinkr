import type { BlinkRow } from "@/components/dashboard/EmployerSession";

const MOCK_EMAILS = [
  "alex.jordan@contractor.dev",
  "sam.rivera@freelance.io",
  "jamie.lee@remote.work",
  "taylor.morgan@build.co",
  "riley.chen@payroll.demo",
  "casey.nguyen@global.team",
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function randomUsdcAmount(): string {
  const n = Math.round((Math.random() * 420 + 5) * 100) / 100;
  return n.toFixed(2);
}

function randomPastIso(withinDays: number): string {
  const ms = Date.now() - Math.random() * withinDays * 24 * 60 * 60 * 1000;
  return new Date(ms).toISOString();
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString();
}

/** Client-only demo rows matching `BlinkRow`; never persist to API or chain. */
export function generateMockTransactions(count = 5): BlinkRow[] {
  const statuses = ["PENDING", "OPENED"] as const;
  const out: BlinkRow[] = [];
  for (let i = 0; i < count; i += 1) {
    const createdAt = randomPastIso(30);
    const status = pick([...statuses]);
    const id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? `mock_${crypto.randomUUID()}`
        : `mock_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 9)}`;
    out.push({
      id,
      contractorEmail: pick(MOCK_EMAILS),
      amountUsdc: randomUsdcAmount(),
      status,
      escrowPDA: null,
      escrowTxSig: null,
      claimTxSig: null,
      expiresAt: addDays(createdAt, 14),
      createdAt,
      claimedAt: null,
    });
  }
  return out;
}
