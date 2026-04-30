import { describe, expect, it } from "vitest";
import { createBlinkBodySchema, decimalUsdcString } from "@/lib/schemas";

describe("createBlinkBodySchema", () => {
  it("accepts string decimals up to 6dp", () => {
    const parsed = createBlinkBodySchema.parse({
      contractorEmail: "a@b.com",
      amountUsdc: "10.123456",
      employerWallet: "7A2de9YeGGMiLtiBBQYELVZyXTA5YCnUdGts9un9aCxa",
    });
    expect(parsed.amountUsdc).toBe("10.123456");
  });

  it("rejects float-like invalid strings", () => {
    expect(() =>
      createBlinkBodySchema.parse({
        contractorEmail: "a@b.com",
        amountUsdc: "10.1234567",
        employerWallet: "7A2de9YeGGMiLtiBBQYELVZyXTA5YCnUdGts9un9aCxa",
      }),
    ).toThrow();
  });
});

describe("decimalUsdcString", () => {
  it("rejects scientific notation", () => {
    expect(decimalUsdcString.safeParse("1e6").success).toBe(false);
  });
});
