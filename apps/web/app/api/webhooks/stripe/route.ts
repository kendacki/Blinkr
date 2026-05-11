import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";

import { finalizeStripeSimulatedOfframp } from "@/lib/offrampStripeFinalize";
import { getStripe } from "@/lib/stripeClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const sig = req.headers.get("stripe-signature");
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!whSecret || !sig) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, sig, whSecret);
  } catch (e) {
    console.error("[stripe webhook] invalid signature", e);
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    try {
      await finalizeStripeSimulatedOfframp(session);
    } catch (e) {
      console.error("[stripe webhook] finalize error", e);
    }
  }

  return NextResponse.json({ received: true });
}
