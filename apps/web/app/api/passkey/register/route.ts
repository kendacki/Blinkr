import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/types";
import { NextRequest } from "next/server";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { ensureBlinkPasskeyAllowed } from "@/lib/blinkGuards";
import { passkeyChallengeKey, type PasskeyChallengePayload } from "@/lib/passkeyChallenge";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { passkeyRegisterBodySchema } from "@/lib/schemas";
import { generateAuthenticationChallenge, generateRegistrationChallenge } from "@/lib/webauthn";

export const runtime = "nodejs";

const CHALLENGE_TTL_SEC = 5 * 60;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = passkeyRegisterBodySchema.parse(json);
    const emailNorm = body.email.trim().toLowerCase();

    const blink = await prisma.blink.findUnique({ where: { id: body.blinkId } });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    if (blink.contractorEmail.trim().toLowerCase() !== emailNorm) {
      throw new ApiError(403, "FORBIDDEN", "Email does not match this Blink");
    }
    ensureBlinkPasskeyAllowed(blink);

    const existing = await prisma.credential.findFirst({
      where: { email: emailNorm },
    });

    const webauthnUserId = `blink:${body.blinkId}`;
    let options: PublicKeyCredentialCreationOptionsJSON | PublicKeyCredentialRequestOptionsJSON;
    let flow: PasskeyChallengePayload["flow"];
    if (existing) {
      flow = "authenticate";
      options = await generateAuthenticationChallenge([existing.credentialId]);
    } else {
      flow = "register";
      options = await generateRegistrationChallenge(webauthnUserId, body.email.trim());
    }

    const challenge = options.challenge;
    const payload: PasskeyChallengePayload = {
      challenge,
      flow,
      email: emailNorm,
      webauthnUserId,
    };
    await getRedis().setex(
      passkeyChallengeKey(body.blinkId),
      CHALLENGE_TTL_SEC,
      JSON.stringify(payload),
    );

    return jsonOk(options);
  } catch (e) {
    return jsonError(e);
  }
}
