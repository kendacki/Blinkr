import { NextRequest } from "next/server";

import { verifyContractorSession } from "@/lib/auth";
import { finalizeStripeSimulatedOfframp } from "@/lib/offrampStripeFinalize";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripeClient";
import { stripeOfframpCompleteBodySchema } from "@/lib/schemas";

export const runtime = "nodejs";

/**
 * Completes Stripe simulated off-ramp + USDC sweep using the Checkout Session id from the
 * return URL. Webhooks are unreliable on localhost; this path is idempotent with the webhook.
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = stripeOfframpCompleteBodySchema.parse(json);
    await verifyContractorSession(
      req.headers.get("authorization"),
      body.blinkId
    );

    let stripe;
    try {
      stripe = getStripe();
    } catch {
      throw new ApiError(
        503,
        "CONFIG",
        "Stripe is not configured (STRIPE_SECRET_KEY)."
      );
    }
    const session = await stripe.checkout.sessions.retrieve(body.sessionId);

    if (session.metadata?.blinkId !== body.blinkId) {
      throw new ApiError(403, "FORBIDDEN", "Checkout session does not match this Blink");
    }

    const offrampId = session.metadata?.offrampId;
    if (!offrampId) {
      throw new ApiError(400, "INVALID_SESSION", "Checkout session is missing offramp metadata");
    }

    const offramp = await prisma.offrampRequest.findUnique({
      where: { id: offrampId },
    });
    if (!offramp || offramp.blinkId !== body.blinkId) {
      throw new ApiError(404, "NOT_FOUND", "Off-ramp record not found for this session");
    }
    if (offramp.provider !== "stripe_sim") {
      throw new ApiError(400, "INVALID_STATE", "Not a Stripe simulated off-ramp");
    }

    if (session.mode !== "setup") {
      throw new ApiError(400, "INVALID_SESSION", "Unexpected Checkout mode");
    }
    if (session.status !== "complete") {
      throw new ApiError(
        400,
        "INCOMPLETE",
        "Stripe Checkout is not complete yet. Wait a moment and try again."
      );
    }

    await finalizeStripeSimulatedOfframp(session);

    const blink = await prisma.blink.findUnique({
      where: { id: body.blinkId },
      select: { status: true },
    });

    return jsonOk({
      ok: true as const,
      blinkStatus: blink?.status ?? null,
    });
  } catch (e) {
    return jsonError(e);
  }
}
