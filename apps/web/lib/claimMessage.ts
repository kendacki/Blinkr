import { PublicKey } from "@solana/web3.js";

/** Must match on-chain `handle_claim_escrow` message layout (104 bytes). */
export function buildClaimAuthorizationMessage(params: {
  blinkIdBytes: Buffer;
  contractorWallet: PublicKey;
  claimNonce: Buffer;
  expirySlot: bigint;
}): Buffer {
  if (params.blinkIdBytes.length !== 32) {
    throw new Error("blinkIdBytes must be 32 bytes");
  }
  if (params.claimNonce.length !== 32) {
    throw new Error("claimNonce must be 32 bytes");
  }
  const out = Buffer.alloc(104);
  params.blinkIdBytes.copy(out, 0);
  params.contractorWallet.toBuffer().copy(out, 32);
  params.claimNonce.copy(out, 64);
  out.writeBigUInt64LE(params.expirySlot, 96);
  return out;
}
