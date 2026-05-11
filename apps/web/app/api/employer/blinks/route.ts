import { NextRequest } from "next/server";
import * as jose from "jose";
import type { Blink } from "@prisma/client";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function walletFromEmployerJwt(
  authHeader: string | null
): Promise<string> {
  if (!authHeader?.startsWith("Bearer ")) {
    throw new ApiError(
      401,
      "UNAUTHORIZED",
      "Missing Authorization bearer token"
    );
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

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

function parseLimit(raw: string | null): number {
  if (!raw) return DEFAULT_LIMIT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, n);
}

export async function GET(req: NextRequest) {
  try {
    const wallet = await walletFromEmployerJwt(
      req.headers.get("authorization")
    );
    const take = parseLimit(req.nextUrl.searchParams.get("limit"));
    const employer = await prisma.employer.findUnique({
      where: { walletAddress: wallet },
      include: {
        blinks: {
          orderBy: { createdAt: "desc" },
          take,
        },
      },
    });
    const blinks =
      employer?.blinks.map((b: Blink) => ({
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
