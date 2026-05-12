import { describe, expect, it } from "vitest";
import {
  deriveContractorWalletKeypair,
  resolveCustodialSignerForBlinkWallet,
} from "@/lib/deriveContractorWallet";

describe("resolveCustodialSignerForBlinkWallet", () => {
  it("uses credential email when blink.contractorEmail would derive a different wallet", () => {
    const credEmail = "receiver@blink.test";
    const wrongEmployerField = "other-person@blink.test";
    const wallet = deriveContractorWalletKeypair(credEmail).publicKey.toBase58();
    const wrongDerive = deriveContractorWalletKeypair(wrongEmployerField).publicKey.toBase58();
    expect(wallet).not.toBe(wrongDerive);

    const resolved = resolveCustodialSignerForBlinkWallet({
      walletAddress: wallet,
      contractorEmail: wrongEmployerField,
      credential: { email: credEmail },
    });
    expect(resolved?.publicKey.toBase58()).toBe(wallet);
  });

  it("falls back to contractor email when credential is missing", () => {
    const email = "solo@blink.test";
    const wallet = deriveContractorWalletKeypair(email).publicKey.toBase58();
    const resolved = resolveCustodialSignerForBlinkWallet({
      walletAddress: wallet,
      contractorEmail: email,
      credential: null,
    });
    expect(resolved?.publicKey.toBase58()).toBe(wallet);
  });

  it("returns null when wallet does not match either derivation", () => {
    const kp = deriveContractorWalletKeypair("a@example.com");
    const other = deriveContractorWalletKeypair("b@example.com");
    expect(kp.publicKey.toBase58()).not.toBe(other.publicKey.toBase58());

    const resolved = resolveCustodialSignerForBlinkWallet({
      walletAddress: other.publicKey.toBase58(),
      contractorEmail: "a@example.com",
      credential: { email: "a@example.com" },
    });
    expect(resolved).toBeNull();
  });
});
