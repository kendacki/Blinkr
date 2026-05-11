import { randomInt } from "crypto";
import { NextRequest } from "next/server";
import { ensureBlinkContractorAllowed } from "@/lib/blinkGuards";
import {
  contractorOtpPayloadKey,
  contractorOtpSendCooldownKey,
  type ContractorOtpPayload,
} from "@/lib/contractorOtp";
import { sendTransactionalEmail } from "@/lib/email";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { contractorSendCodeBodySchema } from "@/lib/schemas";

export const runtime = "nodejs";

const OTP_TTL_SEC = 10 * 60;
const SEND_COOLDOWN_SEC = 60;

function generateSixDigitCode(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { blinkId: string } }
) {
  try {
    const json = await req.json();
    const body = contractorSendCodeBodySchema.parse(json);
    const emailNorm = body.email.trim().toLowerCase();

    const blink = await prisma.blink.findUnique({
      where: { id: params.blinkId },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    ensureBlinkContractorAllowed(blink);
    if (blink.contractorEmail.trim().toLowerCase() !== emailNorm) {
      throw new ApiError(403, "FORBIDDEN", "Email does not match this Blink");
    }

    const redis = getRedis();
    const cooldownKey = contractorOtpSendCooldownKey(params.blinkId);
    const setCooldown = await redis.set(cooldownKey, "1", "EX", SEND_COOLDOWN_SEC, "NX");
    if (setCooldown !== "OK") {
      throw new ApiError(
        429,
        "RATE_LIMIT",
        `Wait ${SEND_COOLDOWN_SEC} seconds before requesting another code`
      );
    }

    const code = generateSixDigitCode();
    const payload: ContractorOtpPayload = { code, emailNorm };
    await redis.setex(
      contractorOtpPayloadKey(params.blinkId),
      OTP_TTL_SEC,
      JSON.stringify(payload)
    );

    const sendResult = await sendTransactionalEmail({
      to: body.email.trim(),
      subject: "Your Blinkr verification code",
      text: `Your verification code is: ${code}\n\nIt expires in ${Math.floor(OTP_TTL_SEC / 60)} minutes. If you did not request this, you can ignore this email.`,
    });

    if (!sendResult.sent) {
      await redis.del(contractorOtpPayloadKey(params.blinkId));
      await redis.del(cooldownKey);
      if (sendResult.skipped) {
        throw new ApiError(
          503,
          "EMAIL_UNAVAILABLE",
          "Email delivery is not configured on this server"
        );
      }
      throw new ApiError(
        502,
        "EMAIL_FAILED",
        sendResult.reason || "Could not send verification email"
      );
    }

    return jsonOk({ ok: true as const });
  } catch (e) {
    return jsonError(e);
  }
}
