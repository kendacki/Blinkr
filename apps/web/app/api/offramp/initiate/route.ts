import { NextRequest } from "next/server";
import { verifyContractorSession } from "@/lib/auth";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { quoteMesoOfframp } from "@/lib/meso";
import { prisma } from "@/lib/prisma";
import { getOfframpQueue } from "@/lib/queue";
import { offrampInitiateBodySchema } from "@/lib/schemas";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = offrampInitiateBodySchema.parse(json);
    await verifyContractorSession(
      req.headers.get("authorization"),
      body.blinkId
    );

    const blink = await prisma.blink.findUnique({
      where: { id: body.blinkId },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    if (blink.walletAddress !== body.walletAddress) {
      throw new ApiError(403, "FORBIDDEN", "Wallet does not match Blink");
    }
    if (blink.status !== "CLAIMED") {
      throw new ApiError(
        400,
        "INVALID_STATE",
        "Off-ramp is only available after the Blink is CLAIMED on-chain"
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
