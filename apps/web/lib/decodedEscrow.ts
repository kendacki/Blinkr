import { PublicKey } from "@solana/web3.js";

const ACCOUNT_DISCRIMINATOR_LEN = 8;

/**
 * Decode `claim_nonce` from raw escrow account data (Anchor `account:EscrowAccount` + Borsh).
 * Layout must match [programs/blinkremit/src/state/escrow.rs](programs/blinkremit/src/state/escrow.rs).
 */
export function decodeEscrowClaimNonce(accountData: Buffer): Buffer {
  if (accountData.length < ACCOUNT_DISCRIMINATOR_LEN + 32 + 8 + 32 + 32 + 32) {
    throw new Error("Escrow account data too short");
  }
  const base = ACCOUNT_DISCRIMINATOR_LEN;
  const nonceOffset = base + 32 + 8 + 32 + 32;
  return Buffer.from(accountData.subarray(nonceOffset, nonceOffset + 32));
}

export function decodeEscrowEmployer(accountData: Buffer): PublicKey {
  const base = ACCOUNT_DISCRIMINATOR_LEN;
  return new PublicKey(accountData.subarray(base, base + 32));
}
