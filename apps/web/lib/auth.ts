import * as jose from "jose";
import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import { ApiError } from "./http";

export function verifyWalletMessageSignature(input: {
  walletAddress: string;
  message: string;
  signatureBase58: string;
}): void {
  let pub: Uint8Array;
  try {
    pub = new PublicKey(input.walletAddress).toBytes();
  } catch {
    throw new ApiError(400, "VALIDATION", "Invalid walletAddress");
  }
  let sig: Uint8Array;
  try {
    sig = bs58.decode(input.signatureBase58);
  } catch {
    throw new ApiError(400, "VALIDATION", "Invalid signatureBase58");
  }
  const msg = new TextEncoder().encode(input.message);
  if (!nacl.sign.detached.verify(msg, sig, pub)) {
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      "Wallet signature verification failed"
    );
  }
}

export async function signEmployerJwt(walletAddress: string): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
  if (!secret.length) {
    throw new ApiError(500, "CONFIG", "JWT_SECRET is not configured");
  }
  return new jose.SignJWT({ walletAddress })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(walletAddress)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
}

export async function verifyEmployerJwt(
  authorizationHeader: string | null,
  expectedEmployerWallet: string
): Promise<jose.JWTPayload> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      "Missing Authorization bearer token"
    );
  }
  const token = authorizationHeader.slice("Bearer ".length).trim();
  const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
  if (!secret.length) {
    throw new ApiError(500, "CONFIG", "JWT_SECRET is not configured");
  }
  let payload: jose.JWTPayload;
  try {
    const verified = await jose.jwtVerify(token, secret);
    payload = verified.payload;
  } catch {
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      "Invalid or expired employer token"
    );
  }
  const wallet =
    typeof payload.walletAddress === "string"
      ? payload.walletAddress
      : typeof payload.sub === "string"
      ? payload.sub
      : null;
  if (!wallet || wallet !== expectedEmployerWallet) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Token wallet does not match employerWallet"
    );
  }
  return payload;
}

export async function verifyContractorSession(
  authorizationHeader: string | null,
  expectedBlinkId: string
): Promise<{ walletAddress: string }> {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      "Missing Authorization bearer token"
    );
  }
  const token = authorizationHeader.slice("Bearer ".length).trim();
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "");
  if (!secret.length) {
    throw new ApiError(500, "CONFIG", "SESSION_SECRET is not configured");
  }
  let payload: jose.JWTPayload;
  try {
    const verified = await jose.jwtVerify(token, secret);
    payload = verified.payload;
  } catch {
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      "Invalid or expired contractor session"
    );
  }
  if (payload.typ !== "contractor") {
    throw new ApiError(403, "FORBIDDEN", "Invalid session type");
  }
  const blinkId = typeof payload.blinkId === "string" ? payload.blinkId : null;
  const walletAddress =
    typeof payload.walletAddress === "string" ? payload.walletAddress : null;
  if (!blinkId || !walletAddress || blinkId !== expectedBlinkId) {
    throw new ApiError(403, "FORBIDDEN", "Session does not match this Blink");
  }
  return { walletAddress };
}

export async function signContractorSessionToken(input: {
  blinkId: string;
  walletAddress: string;
}): Promise<string> {
  const secret = new TextEncoder().encode(process.env.SESSION_SECRET ?? "");
  if (!secret.length) {
    throw new ApiError(500, "CONFIG", "SESSION_SECRET is not configured");
  }
  return new jose.SignJWT({
    typ: "contractor",
    blinkId: input.blinkId,
    walletAddress: input.walletAddress,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(input.walletAddress)
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);
}
