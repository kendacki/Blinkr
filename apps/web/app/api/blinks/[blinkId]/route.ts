import { NextRequest } from "next/server";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const TERMINAL_STATUSES = ["CLAIMED", "OFFRAMPED", "REFUNDED"] as const;

export async function GET(
  _req: NextRequest,
  { params }: { params: { blinkId: string } },
) {
  try {
    const blinkId = params.blinkId;
    const blink = await prisma.blink.findUnique({
      where: { id: blinkId },
      include: { employer: true },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }

    const isTerminal = TERMINAL_STATUSES.includes(
      blink.status as (typeof TERMINAL_STATUSES)[number],
    );
    if (blink.expiresAt.getTime() < Date.now() && !isTerminal) {
      throw new ApiError(410, "GONE", "This Blink has expired");
    }

    return jsonOk({
      blinkId: blink.id,
      amountUsdc: blink.amountUsdc.toString(),
      status: blink.status,
      expiresAt: blink.expiresAt.toISOString(),
      employerName: blink.employer.email ?? "Employer",
    });
  } catch (e) {
    return jsonError(e);
  }
}
