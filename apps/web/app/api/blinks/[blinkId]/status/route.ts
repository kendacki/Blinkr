import { NextRequest } from "next/server";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { assertStatusRateLimit } from "@/lib/rateLimit";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { blinkId: string } }
) {
  try {
    await assertStatusRateLimit(params.blinkId);
    const blink = await prisma.blink.findUnique({
      where: { id: params.blinkId },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    return jsonOk({
      status: blink.status,
      claimTxSig: blink.claimTxSig,
      walletAddress: blink.walletAddress,
      claimedAt: blink.claimedAt?.toISOString() ?? null,
    });
  } catch (e) {
    return jsonError(e);
  }
}
