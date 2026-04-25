import type { BlinkStatus } from "@prisma/client";
import { ApiError } from "@/lib/http";

const transitions: Record<BlinkStatus, BlinkStatus[]> = {
  PENDING: ["OPENED", "EXPIRED", "REFUNDED"],
  OPENED: ["CLAIMED", "EXPIRED", "REFUNDED"],
  CLAIMED: ["OFFRAMPED"],
  OFFRAMPED: [],
  EXPIRED: ["REFUNDED"],
  REFUNDED: [],
};

export function assertBlinkTransition(from: BlinkStatus, to: BlinkStatus): void {
  const allowed = transitions[from];
  if (!allowed.includes(to)) {
    throw new ApiError(409, "INVALID_STATE_TRANSITION", `Cannot move Blink from ${from} to ${to}`);
  }
}

export function isTerminalBlinkStatus(status: BlinkStatus): boolean {
  return status === "CLAIMED" || status === "OFFRAMPED" || status === "REFUNDED";
}
