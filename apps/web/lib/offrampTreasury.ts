import { PublicKey } from "@solana/web3.js";

import { loadRelayerKeypair } from "@/lib/relayer";

/** Devnet: recycle USDC into the relayer’s ATA unless OFFRAMP_TREASURY_WALLET is set. */
export function getOfframpTreasuryOwner(): PublicKey {
  const raw = process.env.OFFRAMP_TREASURY_WALLET?.trim();
  if (raw) {
    return new PublicKey(raw);
  }
  return loadRelayerKeypair().publicKey;
}
