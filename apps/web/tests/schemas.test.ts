import { describe, expect, it } from "vitest";
import { createBlinkBodySchema, decimalUsdcString } from "@/lib/schemas";

describe("createBlinkBodySchema", () => {
  it("accepts string decimals up to 6dp", () => {
    const parsed = createBlinkBodySchema.parse({
      contractorEmail: "a@b.com",
      amountUsdc: "10.123456",
      employerWallet: "246VxdVvQkKDk51fxbAYaszJHsqoRQd8vdqbBy7LKjgx",
    });
    expect(parsed.amountUsdc).toBe("10.123456");
  });

  it("rejects float-like invalid strings", () => {
    expect(() =>
      createBlinkBodySchema.parse({
        contractorEmail: "a@b.com",
        amountUsdc: "10.1234567",
        employerWallet: "246VxdVvQkKDk51fxbAYaszJHsqoRQd8vdqbBy7LKjgx",
      })
    ).toThrow();
  });
});

describe("decimalUsdcString", () => {
  it("rejects scientific notation", () => {
    expect(decimalUsdcString.safeParse("1e6").success).toBe(false);
  });
});
