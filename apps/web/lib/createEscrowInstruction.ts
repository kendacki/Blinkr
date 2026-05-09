import { Buffer } from "buffer";
import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";

/** Anchor `sha256("global:create_escrow")[:8]` */
const CREATE_ESCROW_DISCRIMINATOR = Buffer.from([
  0xfd, 0xd7, 0xa5, 0x74, 0x24, 0x6c, 0x44, 0x50,
]);

function u64le(n: bigint): Buffer {
  const b = Buffer.allocUnsafe(8);
  b.writeBigUInt64LE(n, 0);
  return b;
}

function i64le(n: bigint): Buffer {
  const b = Buffer.allocUnsafe(8);
  b.writeBigInt64LE(n, 0);
  return b;
}

export function buildCreateEscrowInstructionData(params: {
  blinkIdBytes: Buffer;
  amountLamports: bigint;
  expiresAtUnix: bigint;
}): Buffer {
  if (params.blinkIdBytes.length !== 32) {
    throw new Error("blinkIdBytes must be 32 bytes");
  }
  return Buffer.concat([
    CREATE_ESCROW_DISCRIMINATOR,
    params.blinkIdBytes,
    u64le(params.amountLamports),
    i64le(params.expiresAtUnix),
  ]);
}

/**
 * `create_escrow` accounts (Anchor field order on `CreateEscrow`).
 */
export function buildCreateEscrowInstruction(params: {
  programId: PublicKey;
  employer: PublicKey;
  escrow: PublicKey;
  usdcMint: PublicKey;
  employerTokenAccount: PublicKey;
  escrowTokenAccount: PublicKey;
  tokenProgram: PublicKey;
  blinkIdBytes: Buffer;
  amountLamports: bigint;
  expiresAtUnix: bigint;
}): TransactionInstruction {
  const data = buildCreateEscrowInstructionData({
    blinkIdBytes: params.blinkIdBytes,
    amountLamports: params.amountLamports,
    expiresAtUnix: params.expiresAtUnix,
  });
  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.employer, isSigner: true, isWritable: true },
      { pubkey: params.escrow, isSigner: false, isWritable: true },
      { pubkey: params.usdcMint, isSigner: false, isWritable: false },
      {
        pubkey: params.employerTokenAccount,
        isSigner: false,
        isWritable: true,
      },
      { pubkey: params.escrowTokenAccount, isSigner: false, isWritable: true },
      { pubkey: params.tokenProgram, isSigner: false, isWritable: false },
      {
        pubkey: ASSOCIATED_TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}
