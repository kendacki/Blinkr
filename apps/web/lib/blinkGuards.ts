import { ApiError } from "./http";

export type BlinkStatus =
  | "PENDING"
  | "OPENED"
  | "CLAIMED"
  | "OFFRAMPED"
  | "EXPIRED"
  | "REFUNDED";

export function ensureBlinkContractorAllowed(blink: {
  status: BlinkStatus;
  expiresAt: Date;
}): void {
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

/** Send-code / verify-code: claim flow while PENDING/OPENED (non-expired), or session refresh after CLAIMED for cash-out. */
export function ensureBlinkContractorOtpAllowed(blink: {
  status: BlinkStatus;
  expiresAt: Date;
}): void {
  if (
    blink.status === "OFFRAMPED" ||
    blink.status === "REFUNDED" ||
    blink.status === "EXPIRED"
  ) {
    throw new ApiError(410, "GONE", "Blink is no longer actionable");
  }
  if (blink.status === "PENDING" || blink.status === "OPENED") {
    if (blink.expiresAt.getTime() < Date.now()) {
      throw new ApiError(410, "GONE", "This Blink has expired");
    }
  }
}
