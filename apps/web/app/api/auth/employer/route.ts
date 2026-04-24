import { NextRequest } from "next/server";
import { signEmployerJwt, verifyWalletMessageSignature } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/http";
import { employerAuthBodySchema } from "@/lib/schemas";

export const runtime = "nodejs";

/**
 * Exchange a wallet-signed message (e.g. Phantom `signMessage`) for an employer JWT
 * used by `POST /api/blinks/create`.
 */
export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = employerAuthBodySchema.parse(json);
    verifyWalletMessageSignature(body);
    const token = await signEmployerJwt(body.walletAddress);
    return jsonOk({ token, expiresInSec: 7 * 24 * 3600 });
  } catch (e) {
    return jsonError(e);
  }
}
