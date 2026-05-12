import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { PublicKey } from "@solana/web3.js";

import { verifyContractorSession } from "@/lib/auth";
import { assertBlinkTransition } from "@/lib/blinkStateMachine";
import { formatUsdcRaw6 } from "@/lib/contractorUsdcBalance";
import {
  resolveCustodialSignerForBlinkWallet,
} from "@/lib/deriveContractorWallet";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { solanaOfframpTransferBodySchema } from "@/lib/schemas";
import { sweepContractorUsdcToOwner } from "@/lib/sweepContractorUsdc";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = solanaOfframpTransferBodySchema.parse(json);
    const session = await verifyContractorSession(
      req.headers.get("authorization"),
      body.blinkId
    );

    const blink = await prisma.blink.findUnique({
      where: { id: body.blinkId },
      include: { credential: true },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    if (session.walletAddress !== blink.walletAddress || !blink.walletAddress) {
      throw new ApiError(403, "FORBIDDEN", "Session wallet does not match Blink");
    }
    if (blink.status === "OFFRAMPED") {
      throw new ApiError(400, "ALREADY_DONE", "This Blink has already been cashed out");
    }
    if (blink.status !== "CLAIMED") {
      throw new ApiError(
        400,
        "INVALID_STATE",
        "Send to Solana is only available after USDC has been claimed to your Blinkr wallet"
      );
    }

    const processingInflight = await prisma.offrampRequest.findFirst({
      where: {
        blinkId: blink.id,
        status: "processing",
      },
    });
    if (processingInflight) {
      throw new ApiError(
        409,
        "CONFLICT",
        "A payout is already in progress for this Blink — wait for it to finish or fail"
      );
    }

    await prisma.offrampRequest.deleteMany({
      where: {
        blinkId: blink.id,
        provider: "stripe_sim",
        status: "initiated",
      },
    });

    const otherInflight = await prisma.offrampRequest.findFirst({
      where: {
        blinkId: blink.id,
        status: { in: ["initiated", "processing"] },
      },
    });
    if (otherInflight) {
      throw new ApiError(
        409,
        "CONFLICT",
        "Another payout is already in progress for this Blink"
      );
    }

    if (!blink.credential) {
      throw new ApiError(500, "CONFIG", "Blink is missing credential linkage");
    }

    let destination: PublicKey;
    try {
      destination = new PublicKey(body.destinationAddress.trim());
    } catch {
      throw new ApiError(400, "INVALID_ADDRESS", "Not a valid Solana address");
    }

    const contractorKp = resolveCustodialSignerForBlinkWallet(blink);
    if (!contractorKp) {
      const secretOk =
        (process.env.CONTRACTOR_WALLET_DERIVATION_SECRET ?? "").length >= 32;
      if (!secretOk) {
        throw new ApiError(
          503,
          "CONFIG",
          "Server cannot derive custodial wallets. Set CONTRACTOR_WALLET_DERIVATION_SECRET (32+ characters)."
        );
      }
      throw new ApiError(
        400,
        "LEGACY_WALLET",
        "USDC is in the Blinkr claim wallet for this payment, but that wallet is not one this server can sign (older random wallet). The address you entered below is only the recipient. Use Stripe cash-out if available, or contact support with this payment link."
      );
    }
    if (destination.equals(contractorKp.publicKey)) {
      throw new ApiError(
        400,
        "INVALID_ADDRESS",
        "Choose a different wallet than your Blinkr smart wallet"
      );
    }

    const { sweepTxSig, amountRaw } = await sweepContractorUsdcToOwner({
      contractorSigner: contractorKp,
      destinationOwner: destination,
    });

    if (amountRaw === 0n) {
      throw new ApiError(
        400,
        "NO_FUNDS",
        "No USDC balance in your Blinkr wallet to send"
      );
    }
    if (!sweepTxSig) {
      throw new ApiError(500, "CONFIG", "Transfer did not produce a transaction signature");
    }

    const amountDecimal = new Prisma.Decimal(formatUsdcRaw6(amountRaw));

    await prisma.$transaction(async (tx) => {
      const row = await tx.blink.findUnique({ where: { id: blink.id } });
      if (!row || row.status !== "CLAIMED") {
        throw new ApiError(
          409,
          "CONFLICT",
          "This Blink is no longer in a claimable state; refresh the page"
        );
      }
      assertBlinkTransition("CLAIMED", "OFFRAMPED");
      await tx.offrampRequest.create({
        data: {
          blinkId: blink.id,
          provider: "solana_wallet",
          status: "completed",
          amountUsdc: amountDecimal,
          fiatAmount: null,
          fiatCurrency: null,
          providerRef: sweepTxSig,
        },
      });
      await tx.blink.updateMany({
        where: { id: blink.id, status: "CLAIMED" },
        data: { status: "OFFRAMPED" },
      });
    });

    return jsonOk({
      sweepTxSig,
      destinationAddress: destination.toBase58(),
      amountUsdc: formatUsdcRaw6(amountRaw),
      blinkStatus: "OFFRAMPED" as const,
    });
  } catch (e) {
    return jsonError(e);
  }
}
