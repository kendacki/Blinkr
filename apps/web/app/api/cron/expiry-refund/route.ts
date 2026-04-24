import { NextRequest } from "next/server";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function assertCronAuth(req: NextRequest): void {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new ApiError(500, "CONFIG", "CRON_SECRET is not configured");
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid cron authorization");
  }
}

/**
 * Marks expired pending Blinks as EXPIRED in the database (on-chain `refund_escrow` is a separate step).
 */
export async function POST(req: NextRequest) {
  try {
    assertCronAuth(req);
    const now = new Date();
    const res = await prisma.blink.updateMany({
      where: {
        status: { in: ["PENDING", "OPENED"] },
        expiresAt: { lt: now },
      },
      data: { status: "EXPIRED" },
    });
    return jsonOk({ updated: res.count });
  } catch (e) {
    return jsonError(e);
  }
}
