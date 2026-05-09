import { NextRequest } from "next/server";
import { verifyEmployerJwt } from "@/lib/auth";
import { sendTransactionalEmail } from "@/lib/email";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";

const SEND_LIMIT = 5;
const SEND_WINDOW_SEC = 60 * 60; // per hour

async function assertSendLinkRateLimit(input: {
  employerWallet: string;
  blinkId: string;
}): Promise<void> {
  const bucket = Math.floor(Date.now() / (SEND_WINDOW_SEC * 1000));
  const key = `rl:blink_send_link:${input.employerWallet}:${input.blinkId}:${bucket}`;
  const redis = getRedis();
  const n = await redis.incr(key);
  if (n === 1) {
    await redis.expire(key, SEND_WINDOW_SEC * 2);
  }
  if (n > SEND_LIMIT) {
    throw new ApiError(
      429,
      "RATE_LIMIT",
      "Too many email sends for this Blink"
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { blinkId: string } }
) {
  try {
    const blinkId = params.blinkId;
    if (!blinkId) {
      throw new ApiError(400, "VALIDATION", "blinkId is required");
    }

    const url = new URL(req.url);
    const employerWallet = url.searchParams.get("employerWallet") ?? "";
    if (!employerWallet) {
      throw new ApiError(400, "VALIDATION", "Missing employerWallet");
    }

    await verifyEmployerJwt(req.headers.get("authorization"), employerWallet);

    const blink = await prisma.blink.findUnique({
      where: { id: blinkId },
      include: { employer: true },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    if (blink.employer.walletAddress !== employerWallet) {
      throw new ApiError(
        403,
        "FORBIDDEN",
        "Blink does not belong to this employer"
      );
    }

    await assertSendLinkRateLimit({ employerWallet, blinkId });

    const baseUrl = (process.env.NEXT_PUBLIC_URL ?? "").replace(/\/$/, "");
    if (!baseUrl) {
      throw new ApiError(500, "CONFIG", "NEXT_PUBLIC_URL is not configured");
    }
    if (!process.env.RESEND_API_KEY) {
      throw new ApiError(
        500,
        "EMAIL_NOT_CONFIGURED",
        "Email is not configured: RESEND_API_KEY is missing. Add it to apps/web/.env.local and restart the dev server."
      );
    }
    const fromEmail = process.env.FROM_EMAIL ?? "";
    if (!fromEmail || /@example\.(com|org|net)$/i.test(fromEmail)) {
      throw new ApiError(
        500,
        "EMAIL_NOT_CONFIGURED",
        "FROM_EMAIL must be a real address on a domain you have verified in Resend (the placeholder example.com will be rejected)."
      );
    }

    const blinkUrl = `${baseUrl}/blink/${blink.id}`;

    const result = await sendTransactionalEmail({
      to: blink.contractorEmail,
      subject: "Your Blink payment link",
      text: `You have a Blink payment link from ${
        blink.employer.email ?? "your employer"
      }:\n\n${blinkUrl}\n\nIf you weren’t expecting this, you can ignore this email.`,
    });

    if (!result.sent) {
      throw new ApiError(
        502,
        "EMAIL_SEND_FAILED",
        `Email send failed: ${result.reason}`
      );
    }

    return jsonOk({
      sent: true,
      to: blink.contractorEmail,
      providerId: result.id,
    });
  } catch (e) {
    return jsonError(e);
  }
}
