import { Buffer } from "buffer";
import {
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";

/** Anchor `sha256("global:claim_escrow")[:8]` */
const CLAIM_ESCROW_DISCRIMINATOR = Buffer.from([
  0xc8, 0x50, 0xb6, 0x9f, 0x3d, 0x4b, 0x09, 0xcd,
]);

function u64le(n: bigint): Buffer {
  const b = Buffer.allocUnsafe(8);
  b.writeBigUInt64LE(n, 0);
  return b;
}

export function buildClaimEscrowInstructionData(params: {
  contractorWallet: PublicKey;
  credentialHash: Buffer;
  expirySlot: bigint;
  relayerSig: Buffer;
}): Buffer {
  if (params.credentialHash.length !== 32) {
    throw new Error("credentialHash must be 32 bytes");
  }
  if (params.relayerSig.length !== 64) {
    throw new Error("relayerSig must be 64 bytes");
  }
  return Buffer.concat([
    CLAIM_ESCROW_DISCRIMINATOR,
    params.contractorWallet.toBuffer(),
    params.credentialHash,
    u64le(params.expirySlot),
    params.relayerSig,
  ]);
}

export function buildClaimEscrowInstruction(params: {
  programId: PublicKey;
  relayer: PublicKey;
  escrow: PublicKey;
  usdcMint: PublicKey;
  escrowToken: PublicKey;
  contractorToken: PublicKey;
  contractorWallet: PublicKey;
  credentialHash: Buffer;
  expirySlot: bigint;
  relayerSig: Buffer;
  tokenProgram: PublicKey;
}): TransactionInstruction {
  const data = buildClaimEscrowInstructionData({
    contractorWallet: params.contractorWallet,
    credentialHash: params.credentialHash,
    expirySlot: params.expirySlot,
    relayerSig: params.relayerSig,
  });
  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.relayer, isSigner: true, isWritable: true },
      { pubkey: params.escrow, isSigner: false, isWritable: true },
      { pubkey: params.usdcMint, isSigner: false, isWritable: false },
      { pubkey: params.escrowToken, isSigner: false, isWritable: true },
      { pubkey: params.contractorToken, isSigner: false, isWritable: true },
      {
        pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
        isSigner: false,
        isWritable: false,
      },
      { pubkey: params.tokenProgram, isSigner: false, isWritable: false },
    ],
    data,
  });
}
