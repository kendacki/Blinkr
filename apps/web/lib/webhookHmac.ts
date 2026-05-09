import { createHmac, timingSafeEqual } from "crypto";

export function verifyHmacSha256Hex(
  secret: string,
  body: string,
  signatureHeader: string | null
): void {
  if (!signatureHeader) {
    throw new Error("Missing webhook signature header");
  }
  const expected = createHmac("sha256", secret)
    .update(body, "utf8")
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signatureHeader.trim(), "utf8");
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    throw new Error("Invalid webhook signature");
  }
}
