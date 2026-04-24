import { NextRequest } from "next/server";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { verifyHmacSha256Hex } from "@/lib/webhookHmac";
import { sendTransactionalEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text();
    const secret = process.env.MESO_WEBHOOK_SECRET ?? "";
    if (!secret) {
      throw new ApiError(500, "CONFIG", "MESO_WEBHOOK_SECRET is not configured");
    }
    const sig = req.headers.get("Meso-Signature") ?? req.headers.get("meso-signature");
    try {
      verifyHmacSha256Hex(secret, raw, sig);
    } catch {
      throw new ApiError(401, "UNAUTHORIZED", "Invalid Meso webhook signature");
    }

    const payload = JSON.parse(raw) as {
      offrampId?: string;
      status?: string;
      blinkId?: string;
    };

    const offrampId = typeof payload.offrampId === "string" ? payload.offrampId : null;
    const status = typeof payload.status === "string" ? payload.status : "";
    if (!offrampId) {
      return jsonOk({ ok: true, ignored: true });
    }

    await prisma.offrampRequest.updateMany({
      where: { id: offrampId },
      data: { status, updatedAt: new Date() },
    });

    const row = await prisma.offrampRequest.findFirst({
      where: { id: offrampId },
      include: { blink: true },
    });
    if (row?.blink?.contractorEmail && status === "completed") {
      await prisma.blink.update({
        where: { id: row.blinkId },
        data: { status: "OFFRAMPED" },
      });
      await sendTransactionalEmail({
        to: row.blink.contractorEmail,
        subject: "Off-ramp completed",
        text: `Your off-ramp for Blink ${row.blinkId} completed.`,
      });
    }

    return jsonOk({ ok: true });
  } catch (e) {
    if (e instanceof SyntaxError) {
      return jsonError(new ApiError(400, "INVALID_JSON", "Body must be JSON"));
    }
    return jsonError(e);
  }
}
