import { describe, expect, it } from "vitest";
import { amountToLamports, lamportsToAmount } from "@/lib/solana";

describe("amountToLamports / lamportsToAmount", () => {
  it("converts USDC string to lamports without float drift", () => {
    expect(amountToLamports("1")).toBe(1_000_000n);
    expect(amountToLamports("0.1")).toBe(100_000n);
    expect(amountToLamports("1000.000001")).toBe(1_000_000_001n);
  });

  it("round-trips lamports to fixed 6dp string", () => {
    const lamports = amountToLamports("4247.5");
    expect(lamportsToAmount(lamports)).toBe("4247.500000");
  });
});
