import { Keypair } from "@solana/web3.js";
import type { AuthenticationResponseJSON, RegistrationResponseJSON } from "@simplewebauthn/types";
import { NextRequest } from "next/server";
import { signContractorSessionToken } from "@/lib/auth";
import { assertBlinkTransition } from "@/lib/blinkStateMachine";
import { ensureBlinkPasskeyAllowed } from "@/lib/blinkGuards";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { passkeyChallengeKey } from "@/lib/passkeyChallenge";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";
import { passkeyVerifyBodySchema } from "@/lib/schemas";
import { verifyAuthentication, verifyRegistration } from "@/lib/webauthn";

export const runtime = "nodejs";

function isRegistrationCredential(cred: unknown): cred is RegistrationResponseJSON {
  if (!cred || typeof cred !== "object") {
    return false;
  }
  const r = cred as Record<string, unknown>;
  if (r.type !== "public-key") {
    return false;
  }
  const resp = r.response as Record<string, unknown> | undefined;
  return Boolean(resp && typeof resp.attestationObject === "string");
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = passkeyVerifyBodySchema.parse(json);

    const raw = await getRedis().get(passkeyChallengeKey(body.blinkId));
    if (!raw) {
      throw new ApiError(400, "CHALLENGE_EXPIRED", "Passkey challenge expired or missing");
    }
    const stored = JSON.parse(raw) as {
      challenge: string;
      flow: "register" | "authenticate";
      email: string;
      webauthnUserId: string;
    };

    const blink = await prisma.blink.findUnique({ where: { id: body.blinkId } });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    ensureBlinkPasskeyAllowed(blink);
    if (blink.contractorEmail.trim().toLowerCase() !== stored.email) {
      throw new ApiError(403, "FORBIDDEN", "Challenge does not match this Blink");
    }

    const credential = body.credential;
    if (stored.flow === "register" && !isRegistrationCredential(credential)) {
      throw new ApiError(400, "INVALID_CREDENTIAL_TYPE", "Expected registration credential");
    }
    if (stored.flow === "authenticate" && isRegistrationCredential(credential)) {
      throw new ApiError(400, "INVALID_CREDENTIAL_TYPE", "Expected authentication credential");
    }

    if (isRegistrationCredential(credential)) {
      const verified = await verifyRegistration(credential, stored.challenge);
      const wallet = Keypair.generate().publicKey.toBase58();
      const credRow = await prisma.credential.create({
        data: {
          credentialId: verified.credentialId,
          publicKey: Buffer.from(verified.publicKey),
          walletAddress: wallet,
          email: stored.email,
          counter: verified.counter,
        },
      });
      assertBlinkTransition(blink.status, "OPENED");
      await prisma.blink.update({
        where: { id: body.blinkId },
        data: {
          walletAddress: wallet,
          credentialId: credRow.id,
          status: "OPENED",
        },
      });
      const sessionToken = await signContractorSessionToken({
        blinkId: blink.id,
        walletAddress: wallet,
      });
      await getRedis().del(passkeyChallengeKey(body.blinkId));
      return jsonOk({
        walletAddress: wallet,
        claimTxSig: null,
        sessionToken,
      });
    }

    const authCred = credential as AuthenticationResponseJSON;
    const row = await prisma.credential.findUnique({
      where: { credentialId: authCred.id },
    });
    if (!row || row.email !== stored.email) {
      throw new ApiError(403, "FORBIDDEN", "Unknown credential");
    }
    const { newCounter } = await verifyAuthentication(authCred, stored.challenge, {
      credentialId: row.credentialId,
      publicKey: new Uint8Array(row.publicKey),
      counter: row.counter,
    });
    await prisma.credential.update({
      where: { id: row.id },
      data: { counter: newCounter },
    });
    const wallet = row.walletAddress;
    if (
      blink.status === "OPENED" &&
      blink.walletAddress === wallet &&
      blink.credentialId === row.id
    ) {
      const sessionToken = await signContractorSessionToken({
        blinkId: blink.id,
        walletAddress: wallet,
      });
      await getRedis().del(passkeyChallengeKey(body.blinkId));
      return jsonOk({
        walletAddress: wallet,
        claimTxSig: blink.claimTxSig,
        sessionToken,
      });
    }
    assertBlinkTransition(blink.status, "OPENED");
    await prisma.blink.update({
      where: { id: body.blinkId },
      data: {
        walletAddress: wallet,
        credentialId: row.id,
        status: "OPENED",
      },
    });
    const sessionToken = await signContractorSessionToken({
      blinkId: blink.id,
      walletAddress: wallet,
    });
    await getRedis().del(passkeyChallengeKey(body.blinkId));
    return jsonOk({
      walletAddress: wallet,
      claimTxSig: null,
      sessionToken,
    });
  } catch (e) {
    return jsonError(e);
  }
}
