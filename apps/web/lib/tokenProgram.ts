import type { Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

/**
 * SPL mint account owner is the token program (legacy Token or Token-2022).
 */
export async function getMintOwnerProgram(
  connection: Connection,
  mint: PublicKey
): Promise<PublicKey> {
  const info = await connection.getAccountInfo(mint, "confirmed");
  if (!info) {
    throw new Error("Mint account not found");
  }
  return info.owner;
}
