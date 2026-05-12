import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAccount,
  getAssociatedTokenAddressSync,
  TokenAccountNotFoundError,
} from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

import { getConnection } from "@/lib/anchor";
import { getMintOwnerProgram } from "@/lib/tokenProgram";

export function formatUsdcRaw6(raw: bigint): string {
  const neg = raw < 0n;
  const v = neg ? -raw : raw;
  const whole = v / 1_000_000n;
  const frac = v % 1_000_000n;
  if (frac === 0n) {
    return neg ? `-${whole.toString()}` : whole.toString();
  }
  const fracStr = frac.toString().padStart(6, "0").replace(/0+$/, "");
  const core = `${whole}.${fracStr}`;
  return neg ? `-${core}` : core;
}

/**
 * SPL USDC balance for a wallet owner pubkey (ATA may not exist yet → 0).
 */
export async function getWalletUsdcBalance(ownerBase58: string): Promise<{
  raw: bigint;
  formatted: string;
}> {
  const connection = getConnection();
  const mint = new PublicKey(process.env.USDC_MINT_ADDRESS ?? "");
  const tokenProgram = await getMintOwnerProgram(connection, mint);
  const owner = new PublicKey(ownerBase58);
  const ata = getAssociatedTokenAddressSync(
    mint,
    owner,
    false,
    tokenProgram,
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  try {
    const acc = await getAccount(connection, ata, "confirmed", tokenProgram);
    return { raw: acc.amount, formatted: formatUsdcRaw6(acc.amount) };
  } catch (e) {
    if (e instanceof TokenAccountNotFoundError) {
      return { raw: 0n, formatted: "0" };
    }
    throw e;
  }
}
