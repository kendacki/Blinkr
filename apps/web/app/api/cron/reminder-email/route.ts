import { NextRequest } from "next/server";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { sendTransactionalEmail } from "@/lib/email";

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

/** Sends a reminder for Blinks expiring within the next 24 hours (PENDING only). */
export async function POST(req: NextRequest) {
  try {
    assertCronAuth(req);
    const soon = new Date(Date.now() + 24 * 3600 * 1000);
    const rows = await prisma.blink.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lte: soon, gt: new Date() },
      },
    });
    let sent = 0;
    for (const b of rows) {
      await sendTransactionalEmail({
        to: b.contractorEmail,
        subject: "Blink payment reminder",
        text: `A payment link will expire soon. Blink id: ${b.id}`,
      });
      sent += 1;
    }
    return jsonOk({ remindersSent: sent });
  } catch (e) {
    return jsonError(e);
  }
}
