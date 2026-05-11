import { randomBytes, timingSafeEqual } from "crypto";
import { Keypair } from "@solana/web3.js";
import { NextRequest } from "next/server";
import { signContractorSessionToken } from "@/lib/auth";
import { assertBlinkTransition } from "@/lib/blinkStateMachine";
import { ensureBlinkContractorAllowed } from "@/lib/blinkGuards";
import {
  contractorOtpPayloadKey,
  contractorOtpVerifyFailsKey,
  type ContractorOtpPayload,
} from "@/lib/contractorOtp";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { contractorVerifyCodeBodySchema } from "@/lib/schemas";

export const runtime = "nodejs";

const MAX_VERIFY_ATTEMPTS = 8;
const VERIFY_FAIL_TTL_SEC = 15 * 60;

function codesEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  if (ba.length !== bb.length) {
    return false;
  }
  return timingSafeEqual(ba, bb);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { blinkId: string } }
) {
  try {
    const json = await req.json();
    const body = contractorVerifyCodeBodySchema.parse(json);
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
    const payloadKey = contractorOtpPayloadKey(params.blinkId);
    const raw = await redis.get(payloadKey);
    if (!raw) {
      throw new ApiError(
        400,
        "CODE_EXPIRED",
        "Code expired or missing — request a new one"
      );
    }
    const stored = JSON.parse(raw) as ContractorOtpPayload;
    if (stored.emailNorm !== emailNorm) {
      throw new ApiError(403, "FORBIDDEN", "Code was sent to a different email");
    }

    const failsKey = contractorOtpVerifyFailsKey(params.blinkId);
    const fails = Number.parseInt((await redis.get(failsKey)) ?? "0", 10);
    if (fails >= MAX_VERIFY_ATTEMPTS) {
      throw new ApiError(
        429,
        "TOO_MANY_ATTEMPTS",
        "Too many incorrect attempts — request a new code"
      );
    }

    if (!codesEqual(body.code.trim(), stored.code)) {
      await redis.setex(failsKey, VERIFY_FAIL_TTL_SEC, String(fails + 1));
      throw new ApiError(400, "INVALID_CODE", "Incorrect verification code");
    }

    await redis.del(payloadKey);
    await redis.del(failsKey);

    let row = await prisma.credential.findFirst({
      where: { email: emailNorm },
    });
    if (!row) {
      const wallet = Keypair.generate().publicKey.toBase58();
      const claimSecret = randomBytes(32).toString("base64url");
      row = await prisma.credential.create({
        data: {
          credentialId: claimSecret,
          publicKey: Buffer.alloc(32),
          walletAddress: wallet,
          email: emailNorm,
          counter: 0,
        },
      });
    }

    if (blink.status === "PENDING") {
      assertBlinkTransition(blink.status, "OPENED");
      await prisma.blink.update({
        where: { id: params.blinkId },
        data: {
          walletAddress: row.walletAddress,
          credentialId: row.id,
          status: "OPENED",
        },
      });
    } else if (blink.status === "OPENED") {
      if (blink.walletAddress && blink.credentialId) {
        if (blink.credentialId !== row.id || blink.walletAddress !== row.walletAddress) {
          throw new ApiError(
            403,
            "FORBIDDEN",
            "This Blink is linked to a different verified identity"
          );
        }
      } else {
        await prisma.blink.update({
          where: { id: params.blinkId },
          data: {
            walletAddress: row.walletAddress,
            credentialId: row.id,
          },
        });
      }
    } else {
      throw new ApiError(400, "INVALID_STATE", "Blink cannot accept contractor verification");
    }

    const sessionToken = await signContractorSessionToken({
      blinkId: blink.id,
      walletAddress: row.walletAddress,
    });

    return jsonOk({
      walletAddress: row.walletAddress,
      claimTxSig: blink.claimTxSig,
      sessionToken,
    });
  } catch (e) {
    return jsonError(e);
  }
}
