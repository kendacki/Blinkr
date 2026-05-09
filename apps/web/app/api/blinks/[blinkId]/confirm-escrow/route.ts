import { NextRequest } from "next/server";
import { z } from "zod";
import { getConnection } from "@/lib/anchor";
import { verifyEmployerJwt } from "@/lib/auth";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const bodySchema = z.object({
  escrowTxSig: z.string().min(32).max(128),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { blinkId: string } }
) {
  try {
    const json = await req.json();
    const body = bodySchema.parse(json);

    const blink = await prisma.blink.findUnique({
      where: { id: params.blinkId },
      include: { employer: true },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }

    await verifyEmployerJwt(
      req.headers.get("authorization"),
      blink.employer.walletAddress
    );

    if (blink.escrowTxSig) {
      if (blink.escrowTxSig === body.escrowTxSig) {
        return jsonOk({
          ok: true,
          escrowTxSig: blink.escrowTxSig,
          idempotent: true,
        });
      }
      throw new ApiError(
        409,
        "CONFLICT",
        "Blink already has a different escrow transaction recorded"
      );
    }

    const connection = getConnection();
    const landed = await connection.getTransaction(body.escrowTxSig, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
    if (!landed) {
      throw new ApiError(
        400,
        "NOT_FOUND",
        "Transaction not found yet; wait for confirmation and retry"
      );
    }
    if (landed.meta?.err) {
      throw new ApiError(400, "TX_FAILED", "On-chain transaction failed");
    }

    await prisma.blink.update({
      where: { id: blink.id },
      data: { escrowTxSig: body.escrowTxSig },
    });

    return jsonOk({ ok: true, escrowTxSig: body.escrowTxSig });
  } catch (e) {
    return jsonError(e);
  }
}
