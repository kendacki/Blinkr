import { Keypair } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import { buildClaimAuthorizationMessage } from "@/lib/claimMessage";

describe("buildClaimAuthorizationMessage", () => {
  it("produces 104-byte payload", () => {
    const msg = buildClaimAuthorizationMessage({
      blinkIdBytes: Buffer.alloc(32, 1),
      contractorWallet: Keypair.generate().publicKey,
      claimNonce: Buffer.alloc(32, 2),
      expirySlot: 123456789n,
    });
    expect(msg.length).toBe(104);
    expect(msg.readBigUInt64LE(96)).toBe(123456789n);
  });
});
