import { NextRequest } from "next/server";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { verifyHmacSha256Hex } from "@/lib/webhookHmac";

export const runtime = "nodejs";

/**
 * Helius Enhanced Webhooks: verify `Helius-Signature` (HMAC-SHA256 of raw body).
 * Event parsing is intentionally conservative; extend when you wire program log subscriptions.
 */
export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const secret = process.env.HELIUS_WEBHOOK_AUTH_HEADER ?? "";
    if (!secret) {
      throw new ApiError(
        500,
        "CONFIG",
        "HELIUS_WEBHOOK_AUTH_HEADER is not configured"
      );
    }
    const sig =
      req.headers.get("Helius-Signature") ??
      req.headers.get("helius-signature") ??
      req.headers.get("x-helius-signature");
    try {
      verifyHmacSha256Hex(secret, raw, sig);
    } catch {
      throw new ApiError(
        401,
        "UNAUTHORIZED",
        "Invalid Helius webhook signature"
      );
    }

    const payload = JSON.parse(raw) as Record<string, unknown>;
    const type = typeof payload.type === "string" ? payload.type : "";

    if (type.includes("CLAIM") || type.includes("EscrowClaimed")) {
      const blinkId =
        typeof payload.blinkId === "string"
          ? payload.blinkId
          : typeof (payload as { meta?: { blinkId?: string } }).meta
              ?.blinkId === "string"
          ? (payload as { meta?: { blinkId?: string } }).meta!.blinkId
          : null;
      if (blinkId) {
        await prisma.blink.updateMany({
          where: { id: blinkId },
          data: { status: "CLAIMED", claimedAt: new Date() },
        });
      }
    }
    if (type.includes("REFUND") || type.includes("EscrowRefunded")) {
      const blinkId =
        typeof payload.blinkId === "string" ? payload.blinkId : null;
      if (blinkId) {
        await prisma.blink.updateMany({
          where: { id: blinkId },
          data: { status: "REFUNDED" },
        });
      }
    }

    return jsonOk({ ok: true });
  } catch (e) {
    if (e instanceof SyntaxError) {
      return jsonError(new ApiError(400, "INVALID_JSON", "Body must be JSON"));
    }
    return jsonError(e);
  }
}
