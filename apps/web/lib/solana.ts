import { createHash } from "crypto";
import { PublicKey } from "@solana/web3.js";
import Decimal from "decimal.js";

const USDC_DECIMALS = 6;
const LAMPORTS_PER_USDC = new Decimal(10).pow(USDC_DECIMALS);

/**
 * Convert a USDC amount string (up to 6 decimal places) to lamports (u64).
 * Uses decimal.js to avoid float rounding (BUG-03).
 */
export function amountToLamports(usdc: string): bigint {
  const d = new Decimal(usdc);
  if (d.lt(0)) {
    throw new Error("amount must be non-negative");
  }
  const lamports = d.mul(LAMPORTS_PER_USDC).toDecimalPlaces(0, Decimal.ROUND_HALF_UP);
  return BigInt(lamports.toFixed(0));
}

export function lamportsToAmount(lamports: bigint): string {
  return new Decimal(lamports.toString()).div(LAMPORTS_PER_USDC).toFixed(6);
}

const ESCROW_SEED = Buffer.from("escrow", "utf8");

/**
 * 32-byte blink id for on-chain PDA seeds (hash of DB blink id).
 */
export function blinkDbIdToBytes(blinkDbId: string): Buffer {
  return createHash("sha256").update(blinkDbId, "utf8").digest();
}

export function getEscrowPDA(
  programId: PublicKey,
  employer: PublicKey,
  blinkIdBytes: Buffer,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [ESCROW_SEED, employer.toBuffer(), blinkIdBytes],
    programId,
  );
}

/**
 * Placeholder for submitting employer-signed transactions (MVP seam).
 */
export async function submitSerializedTransaction(_serializedTxBase64: string): Promise<string> {
  throw new Error(
    "submitSerializedTransaction is not wired in MVP; employer client should submit via wallet.",
  );
}
