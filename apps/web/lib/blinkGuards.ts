import { ApiError } from "./http";

export type BlinkStatus = "PENDING" | "OPENED" | "CLAIMED" | "OFFRAMPED" | "EXPIRED" | "REFUNDED";

export function ensureBlinkPasskeyAllowed(blink: { status: BlinkStatus; expiresAt: Date }): void {
  if (
    blink.status === "CLAIMED" ||
    blink.status === "OFFRAMPED" ||
    blink.status === "REFUNDED" ||
    blink.status === "EXPIRED"
  ) {
    throw new ApiError(410, "GONE", "Blink is no longer actionable");
  }
  if (blink.expiresAt.getTime() < Date.now()) {
    throw new ApiError(410, "GONE", "This Blink has expired");
  }
}
