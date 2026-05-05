import { Keypair, PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import {
  buildClaimAuthorizationMessage,
  CLAIM_AUTHORIZATION_MESSAGE_LEN,
} from "@/lib/claimMessage";

describe("buildClaimAuthorizationMessage", () => {
  it("produces 344-byte payload with expected tail fields", () => {
    const programId = Keypair.generate().publicKey;
    const escrow = Keypair.generate().publicKey;
    const employer = Keypair.generate().publicKey;
    const contractor = Keypair.generate().publicKey;
    const usdcMint = Keypair.generate().publicKey;
    const tokenProgram = Keypair.generate().publicKey;
    const escrowToken = Keypair.generate().publicKey;
    const msg = buildClaimAuthorizationMessage({
      programId,
      escrow,
      blinkIdBytes: Buffer.alloc(32, 1),
      employer,
      contractorWallet: contractor,
      amount: 99n,
      usdcMint,
      tokenProgram,
      escrowTokenAccount: escrowToken,
      expiresAt: 1700000000n,
      claimNonce: Buffer.alloc(32, 2),
      credentialHash: Buffer.alloc(32, 3),
      expirySlot: 123456789n,
    });
    expect(msg.length).toBe(CLAIM_AUTHORIZATION_MESSAGE_LEN);
    expect(msg.readBigUInt64LE(160)).toBe(99n);
    expect(msg.readBigInt64LE(264)).toBe(1700000000n);
    expect(msg.readBigUInt64LE(336)).toBe(123456789n);
  });
});
