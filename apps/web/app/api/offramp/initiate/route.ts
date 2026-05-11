import { NextRequest } from "next/server";

import { verifyContractorSession } from "@/lib/auth";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { quoteMesoOfframp } from "@/lib/meso";
import { prisma } from "@/lib/prisma";
import { getOfframpQueue } from "@/lib/queue";
import { getStripe } from "@/lib/stripeClient";
import { offrampInitiateBodySchema } from "@/lib/schemas";

export const runtime = "nodejs";

function appBaseUrl(): string {
  const u =
    process.env.NEXT_PUBLIC_URL?.trim() ||
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    "http://localhost:3000";
  return u.replace(/\/$/, "");
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = offrampInitiateBodySchema.parse(json);
    const session = await verifyContractorSession(
      req.headers.get("authorization"),
      body.blinkId
    );

    const blink = await prisma.blink.findUnique({
      where: { id: body.blinkId },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    if (session.walletAddress !== blink.walletAddress) {
      throw new ApiError(403, "FORBIDDEN", "Session wallet does not match Blink");
    }
    if (blink.status === "OFFRAMPED") {
      throw new ApiError(400, "ALREADY_DONE", "This Blink has already been cashed out");
    }
    if (blink.status !== "CLAIMED") {
      throw new ApiError(
        400,
        "INVALID_STATE",
        "Off-ramp is only available after the Blink is CLAIMED on-chain"
      );
    }

    const inflight = await prisma.offrampRequest.findFirst({
      where: {
        blinkId: blink.id,
        status: { in: ["initiated", "processing"] },
      },
    });
    if (inflight) {
      throw new ApiError(
        409,
        "CONFLICT",
        "An off-ramp is already in progress for this Blink"
      );
    }

    if (body.provider === "stripe_sim") {
      const quote = await quoteMesoOfframp({
        amountUsdc: blink.amountUsdc.toString(),
        currency: "USD",
      });

      const offramp = await prisma.offrampRequest.create({
        data: {
          blinkId: blink.id,
          provider: "stripe_sim",
          status: "initiated",
          amountUsdc: blink.amountUsdc,
          fiatCurrency: quote.currency,
          fiatAmount: blink.amountUsdc,
          providerRef: null,
        },
      });

      let stripe;
      try {
        stripe = getStripe();
      } catch {
        await prisma.offrampRequest.delete({ where: { id: offramp.id } });
        throw new ApiError(
          503,
          "CONFIG",
          "Stripe is not configured. Set STRIPE_SECRET_KEY to enable simulated cash-out."
        );
      }

      const base = appBaseUrl();
      let sessionStripe;
      try {
        sessionStripe = await stripe.checkout.sessions.create({
          mode: "setup",
          payment_method_types: ["card"],
          success_url: `${base}/blink/${encodeURIComponent(
            blink.id
          )}?offramp=complete&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${base}/blink/${encodeURIComponent(
            blink.id
          )}?offramp=cancel`,
          customer_email: blink.contractorEmail,
          metadata: {
            offrampId: offramp.id,
            blinkId: blink.id,
          },
        });
      } catch (e) {
        await prisma.offrampRequest.delete({ where: { id: offramp.id } });
        console.error("[offramp initiate] Stripe session create failed", e);
        throw new ApiError(
          502,
          "STRIPE_ERROR",
          "Could not start Stripe Checkout. Check STRIPE_SECRET_KEY and dashboard settings."
        );
      }

      if (!sessionStripe.url) {
        await prisma.offrampRequest.delete({ where: { id: offramp.id } });
        throw new ApiError(502, "STRIPE_ERROR", "Stripe did not return a checkout URL");
      }

      return jsonOk({
        offrampId: offramp.id,
        checkoutUrl: sessionStripe.url,
        estimatedFiat: blink.amountUsdc.toString(),
        currency: quote.currency,
        provider: "stripe_sim" as const,
      });
    }

    if (!body.bankDetails || Object.keys(body.bankDetails).length === 0) {
      throw new ApiError(
        400,
        "VALIDATION",
        "bankDetails is required for this provider"
      );
    }

    const quote =
      body.provider === "meso"
        ? await quoteMesoOfframp({
            amountUsdc: blink.amountUsdc.toString(),
            currency: "USD",
          })
        : await quoteMesoOfframp({
            amountUsdc: blink.amountUsdc.toString(),
            currency: "USD",
          });

    const offramp = await prisma.offrampRequest.create({
      data: {
        blinkId: blink.id,
        provider: body.provider,
        status: "initiated",
        amountUsdc: blink.amountUsdc,
        fiatCurrency: quote.currency,
        fiatAmount: quote.estimatedFiat,
        providerRef: null,
      },
    });

    await getOfframpQueue().add(
      "process",
      {
        offrampId: offramp.id,
        bankDetails: body.bankDetails,
        provider: body.provider,
      },
      { removeOnComplete: true }
    );

    return jsonOk({
      offrampId: offramp.id,
      estimatedFiat: quote.estimatedFiat,
      currency: quote.currency,
      eta: `${quote.etaMinutes}m`,
    });
  } catch (e) {
    return jsonError(e);
  }
}
