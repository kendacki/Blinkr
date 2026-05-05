import { PublicKey } from "@solana/web3.js";

/** Must match on-chain `handle_claim_escrow` message layout (344 bytes). */
export const CLAIM_AUTHORIZATION_MESSAGE_LEN = 344;

/**
 * Relayer Ed25519 payload: program_id | escrow | blink_id | employer | contractor |
 * amount | usdc_mint | token_program | escrow_token | expires_at | claim_nonce |
 * credential_hash | expiry_slot (all fixed width; u64/i64 little-endian).
 */
export function buildClaimAuthorizationMessage(params: {
  programId: PublicKey;
  escrow: PublicKey;
  blinkIdBytes: Buffer;
  employer: PublicKey;
  contractorWallet: PublicKey;
  amount: bigint;
  usdcMint: PublicKey;
  tokenProgram: PublicKey;
  escrowTokenAccount: PublicKey;
  expiresAt: bigint;
  claimNonce: Buffer;
  credentialHash: Buffer;
  expirySlot: bigint;
}): Buffer {
  if (params.blinkIdBytes.length !== 32) {
    throw new Error("blinkIdBytes must be 32 bytes");
  }
  if (params.claimNonce.length !== 32) {
    throw new Error("claimNonce must be 32 bytes");
  }
  if (params.credentialHash.length !== 32) {
    throw new Error("credentialHash must be 32 bytes");
  }
  const out = Buffer.alloc(CLAIM_AUTHORIZATION_MESSAGE_LEN);
  let o = 0;
  params.programId.toBuffer().copy(out, o);
  o += 32;
  params.escrow.toBuffer().copy(out, o);
  o += 32;
  params.blinkIdBytes.copy(out, o);
  o += 32;
  params.employer.toBuffer().copy(out, o);
  o += 32;
  params.contractorWallet.toBuffer().copy(out, o);
  o += 32;
  out.writeBigUInt64LE(params.amount, o);
  o += 8;
  params.usdcMint.toBuffer().copy(out, o);
  o += 32;
  params.tokenProgram.toBuffer().copy(out, o);
  o += 32;
  params.escrowTokenAccount.toBuffer().copy(out, o);
  o += 32;
  out.writeBigInt64LE(params.expiresAt, o);
  o += 8;
  params.claimNonce.copy(out, o);
  o += 32;
  params.credentialHash.copy(out, o);
  o += 32;
  out.writeBigUInt64LE(params.expirySlot, o);
  return out;
}
