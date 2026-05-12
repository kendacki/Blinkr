import type Stripe from "stripe";

import { assertBlinkTransition } from "@/lib/blinkStateMachine";
import { resolveCustodialSignerForBlinkWallet } from "@/lib/deriveContractorWallet";
import { prisma } from "@/lib/prisma";
import { sweepContractorUsdcToTreasury } from "@/lib/sweepContractorUsdc";
import { getOfframpTreasuryOwner } from "@/lib/offrampTreasury";

async function commitStripeOfframpSuccess(
  offrampId: string,
  blinkId: string,
  sessionId: string,
  providerRefExtra?: string
): Promise<void> {
  const providerRef = providerRefExtra
    ? `${sessionId}|${providerRefExtra}`
    : sessionId;
  await prisma.$transaction(async (tx) => {
    const blinkRow = await tx.blink.findUnique({ where: { id: blinkId } });
    if (!blinkRow) {
      return;
    }

    if (blinkRow.status === "CLAIMED") {
      assertBlinkTransition("CLAIMED", "OFFRAMPED");
      await tx.blink.updateMany({
        where: { id: blinkId, status: "CLAIMED" },
        data: { status: "OFFRAMPED" },
      });
    }

    await tx.offrampRequest.updateMany({
      where: { id: offrampId, status: { not: "completed" } },
      data: {
        status: "completed",
        providerRef,
        fiatAmount: blinkRow.amountUsdc,
        fiatCurrency: "USD",
      },
    });
  });
}

/**
 * After Stripe Checkout (setup mode) completes, sweep USDC from the contractor ATA
 * when the server holds the signing key (derived wallet). Legacy random wallets
 * skip the sweep but still complete the simulated payout + Blink OFFRAMPED.
 */
export async function finalizeStripeSimulatedOfframp(
  session: Stripe.Checkout.Session
): Promise<void> {
  if (session.mode !== "setup" || session.status !== "complete") {
    return;
  }

  const offrampId = session.metadata?.offrampId;
  const blinkId = session.metadata?.blinkId;
  if (!offrampId || !blinkId) {
    return;
  }

  const offramp = await prisma.offrampRequest.findUnique({
    where: { id: offrampId },
    include: { blink: { include: { credential: true } } },
  });
  if (!offramp || offramp.blinkId !== blinkId) {
    return;
  }
  if (offramp.provider !== "stripe_sim") {
    return;
  }

  const blink = offramp.blink;
  if (blink.status === "OFFRAMPED" || offramp.status === "completed") {
    return;
  }
  if (blink.status !== "CLAIMED") {
    return;
  }
  if (!blink.walletAddress) {
    await prisma.offrampRequest.update({
      where: { id: offramp.id },
      data: { status: "failed", providerRef: session.id },
    });
    return;
  }

  const secretOk =
    (process.env.CONTRACTOR_WALLET_DERIVATION_SECRET ?? "").length >= 32;
  const contractorKp = resolveCustodialSignerForBlinkWallet(blink);
  if (!contractorKp) {
    if (!secretOk) {
      await prisma.offrampRequest.update({
        where: { id: offramp.id },
        data: { status: "failed", providerRef: session.id },
      });
      return;
    }
    await prisma.offrampRequest.updateMany({
      where: {
        id: offramp.id,
        status: { in: ["initiated", "failed"] },
      },
      data: { status: "processing", providerRef: session.id },
    });
    await commitStripeOfframpSuccess(
      offramp.id,
      blink.id,
      session.id,
      "legacy_no_sweep"
    );
    return;
  }

  await prisma.offrampRequest.updateMany({
    where: {
      id: offramp.id,
      status: { in: ["initiated", "failed"] },
    },
    data: { status: "processing", providerRef: session.id },
  });

  const treasury = getOfframpTreasuryOwner();

  try {
    await sweepContractorUsdcToTreasury({
      contractorSigner: contractorKp,
      treasuryOwner: treasury,
    });

    await commitStripeOfframpSuccess(offramp.id, blink.id, session.id);
  } catch (e) {
    console.error("[offramp stripe] sweep failed", e);
    await prisma.offrampRequest.update({
      where: { id: offramp.id },
      data: { status: "failed", providerRef: session.id },
    });
  }
}
