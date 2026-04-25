import { describe, expect, it } from "vitest";
import { Keypair } from "@solana/web3.js";
import { ASSOCIATED_TOKEN_PROGRAM_ID, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { createHash } from "crypto";
import { buildCreateEscrowInstruction, buildCreateEscrowInstructionData } from "@/lib/createEscrowInstruction";

describe("createEscrowInstruction", () => {
  it("encodes fixed-length instruction data", () => {
    const blinkId = createHash("sha256").update("test-blink-id", "utf8").digest();
    const data = buildCreateEscrowInstructionData({
      blinkIdBytes: blinkId,
      amountLamports: 1_000_000n,
      expiresAtUnix: 1_700_000_000n,
    });
    expect(data.length).toBe(8 + 32 + 8 + 8);
  });

  it("builds an instruction with eight accounts", () => {
    const programId = Keypair.generate().publicKey;
    const employer = Keypair.generate().publicKey;
    const escrow = Keypair.generate().publicKey;
    const mint = Keypair.generate().publicKey;
    const employerAta = Keypair.generate().publicKey;
    const escrowAta = Keypair.generate().publicKey;
    const blinkId = Buffer.alloc(32, 7);
    const ix = buildCreateEscrowInstruction({
      programId,
      employer,
      escrow,
      usdcMint: mint,
      employerTokenAccount: employerAta,
      escrowTokenAccount: escrowAta,
      tokenProgram: TOKEN_PROGRAM_ID,
      blinkIdBytes: blinkId,
      amountLamports: 100n,
      expiresAtUnix: 99n,
    });
    expect(ix.programId.equals(programId)).toBe(true);
    expect(ix.keys.length).toBe(8);
    expect(ix.keys[6].pubkey.equals(ASSOCIATED_TOKEN_PROGRAM_ID)).toBe(true);
  });
});
