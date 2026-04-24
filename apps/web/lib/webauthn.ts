import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { isoBase64URL } from "@simplewebauthn/server/helpers";
import type {
  AuthenticationResponseJSON,
  AuthenticatorTransportFuture,
  RegistrationResponseJSON,
} from "@simplewebauthn/types";
import { createHash } from "crypto";

export function getRpConfig(): { rpName: string; rpID: string; origin: string } {
  const rpID = process.env.RP_ID;
  const origin = process.env.NEXT_PUBLIC_URL;
  if (!rpID || !origin) {
    throw new Error("RP_ID and NEXT_PUBLIC_URL must be set for WebAuthn");
  }
  return { rpName: "Blinkr", rpID, origin };
}

export async function generateRegistrationChallenge(userId: string, email: string) {
  const { rpName, rpID } = getRpConfig();
  return generateRegistrationOptions({
    rpName,
    rpID,
    userID: Buffer.from(userId, "utf8").toString("base64url"),
    userName: email,
    attestationType: "none",
    authenticatorSelection: {
      authenticatorAttachment: "platform",
      requireResidentKey: true,
      userVerification: "required",
    },
  });
}

export async function generateAuthenticationChallenge(credentialIds: string[]) {
  const { rpID } = getRpConfig();
  const allowCredentials = credentialIds.map((credentialId) => ({
    id: isoBase64URL.toBuffer(credentialId),
    type: "public-key" as const,
    transports: ["internal", "hybrid"] as AuthenticatorTransportFuture[],
  }));
  return generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials,
  });
}

export async function verifyRegistration(
  credential: RegistrationResponseJSON,
  expectedChallenge: string,
): Promise<{
  credentialId: string;
  publicKey: Uint8Array;
  counter: number;
  credentialHash: Buffer;
}> {
  const { rpID, origin } = getRpConfig();
  const result = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
  });
  if (!result.verified || !result.registrationInfo) {
    throw new Error("Registration verification failed");
  }
  const { credentialID, credentialPublicKey, counter } = result.registrationInfo;
  const credentialId = credential.id;
  const credentialHash = createHash("sha256").update(Buffer.from(credentialId, "utf8")).digest();
  return {
    credentialId,
    publicKey: credentialPublicKey,
    counter,
    credentialHash,
  };
}

export async function verifyAuthentication(
  credential: AuthenticationResponseJSON,
  expectedChallenge: string,
  storedCred: { credentialId: string; publicKey: Uint8Array; counter: number },
): Promise<{ newCounter: number }> {
  const { rpID, origin } = getRpConfig();
  const result = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpID,
    authenticator: {
      credentialID: isoBase64URL.toBuffer(storedCred.credentialId),
      credentialPublicKey: storedCred.publicKey,
      counter: storedCred.counter,
    },
  });
  if (!result.verified) {
    throw new Error("Authentication verification failed");
  }
  return { newCounter: result.authenticationInfo.newCounter };
}
