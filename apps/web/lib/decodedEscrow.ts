import { PublicKey } from "@solana/web3.js";

const ACCOUNT_DISCRIMINATOR_LEN = 8;

/**
 * Decode fields required for relayer claim authorization (Anchor `EscrowAccount` + Borsh).
 * Layout must match [programs/blinkremit/src/state/escrow.rs](programs/blinkremit/src/state/escrow.rs).
 */
export interface EscrowClaimAuthFields {
  employer: PublicKey;
  usdcMint: PublicKey;
  tokenProgram: PublicKey;
  escrowTokenAccount: PublicKey;
  amount: bigint;
  blinkId: Buffer;
  claimNonce: Buffer;
  expiresAt: bigint;
}

export function decodeEscrowClaimAuthFields(
  accountData: Buffer
): EscrowClaimAuthFields {
  const base = ACCOUNT_DISCRIMINATOR_LEN;
  if (accountData.length < base + 232) {
    throw new Error("Escrow account data too short");
  }
  const employer = new PublicKey(accountData.subarray(base, base + 32));
  const usdcMint = new PublicKey(accountData.subarray(base + 32, base + 64));
  const tokenProgram = new PublicKey(
    accountData.subarray(base + 64, base + 96)
  );
  const escrowTokenAccount = new PublicKey(
    accountData.subarray(base + 96, base + 128)
  );
  const amount = accountData.readBigUInt64LE(base + 128);
  const blinkId = Buffer.from(accountData.subarray(base + 136, base + 168));
  const claimNonce = Buffer.from(accountData.subarray(base + 200, base + 232));

  let off = base + 232;
  const contractorTag = accountData.readUInt8(off);
  off += 1;
  if (contractorTag === 1) {
    off += 32;
  } else if (contractorTag !== 0) {
    throw new Error("Invalid escrow contractor_wallet option tag");
  }
  off += 1; // EscrowStatus
  off += 8; // created_at
  if (accountData.length < off + 8) {
    throw new Error("Escrow account data too short for expires_at");
  }
  const expiresAt = accountData.readBigInt64LE(off);

  return {
    employer,
    usdcMint,
    tokenProgram,
    escrowTokenAccount,
    amount,
    blinkId,
    claimNonce,
    expiresAt,
  };
}

export function decodeEscrowClaimNonce(accountData: Buffer): Buffer {
  return decodeEscrowClaimAuthFields(accountData).claimNonce;
}

export function decodeEscrowEmployer(accountData: Buffer): PublicKey {
  const base = ACCOUNT_DISCRIMINATOR_LEN;
  return new PublicKey(accountData.subarray(base, base + 32));
}
