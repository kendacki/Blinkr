import { NextRequest } from "next/server";

import { verifyContractorSession } from "@/lib/auth";
import { getWalletUsdcBalance } from "@/lib/contractorUsdcBalance";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { blinkId: string } }
) {
  try {
    const session = await verifyContractorSession(
      req.headers.get("authorization"),
      params.blinkId
    );

    const blink = await prisma.blink.findUnique({
      where: { id: params.blinkId },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    if (!blink.walletAddress) {
      throw new ApiError(
        400,
        "INVALID_STATE",
        "This Blink does not have a receiver wallet linked yet"
      );
    }
    if (session.walletAddress !== blink.walletAddress) {
      throw new ApiError(403, "FORBIDDEN", "Session wallet does not match Blink");
    }

    const { raw, formatted } = await getWalletUsdcBalance(blink.walletAddress);

    return jsonOk({
      walletAddress: blink.walletAddress,
      balanceUsdc: formatted,
      balanceRaw: raw.toString(),
    });
  } catch (e) {
    return jsonError(e);
  }
}
