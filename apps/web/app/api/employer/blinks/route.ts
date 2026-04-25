import { NextRequest } from "next/server";
import * as jose from "jose";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function walletFromEmployerJwt(authHeader: string | null): Promise<string> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(401, "UNAUTHORIZED", "Missing Authorization bearer token");
  }
  const token = authHeader.slice("Bearer ".length).trim();
  const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
  const { payload } = await jose.jwtVerify(token, secret);
  const wallet =
    typeof payload.walletAddress === "string"
      ? payload.walletAddress
      : typeof payload.sub === "string"
        ? payload.sub
        : null;
  if (!wallet) {
    throw new ApiError(401, "UNAUTHORIZED", "Invalid employer token");
  }
  return wallet;
}

export async function GET(req: NextRequest) {
  try {
    const wallet = await walletFromEmployerJwt(req.headers.get("authorization"));
    const employer = await prisma.employer.findUnique({
      where: { walletAddress: wallet },
      include: {
        blinks: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
      },
    });
    const blinks =
      employer?.blinks.map((b) => ({
        id: b.id,
        contractorEmail: b.contractorEmail,
        amountUsdc: b.amountUsdc.toString(),
        status: b.status,
        escrowPDA: b.escrowPDA,
        escrowTxSig: b.escrowTxSig,
        claimTxSig: b.claimTxSig,
        expiresAt: b.expiresAt.toISOString(),
        createdAt: b.createdAt.toISOString(),
        claimedAt: b.claimedAt?.toISOString() ?? null,
      })) ?? [];
    return jsonOk({ blinks });
  } catch (e) {
    return jsonError(e);
  }
}
