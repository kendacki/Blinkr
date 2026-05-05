import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";
import { NextRequest } from "next/server";
import * as jose from "jose";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { getConnection } from "@/lib/anchor";
import { getRedis } from "@/lib/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CACHE_TTL_SEC = 10;

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get("authorization");
    if (!auth?.startsWith("Bearer ")) {
      throw new ApiError(401, "UNAUTHORIZED", "Missing Authorization bearer token");
    }
    const token = auth.slice("Bearer ".length).trim();
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

    const cacheKey = `employer:usdc_balance:${wallet}`;
    const redis = getRedis();
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { usdcBalance: string; usdcMint: string };
      return jsonOk({ walletAddress: wallet, ...parsed });
    }

    const connection = getConnection();
    const mint = new PublicKey(process.env.USDC_MINT_ADDRESS ?? "");
    const owner = new PublicKey(wallet);
    const ata = getAssociatedTokenAddressSync(mint, owner, false);
    const info = await connection.getTokenAccountBalance(ata).catch(() => null);
    const raw = info?.value?.uiAmountString ?? "0.000000";
    const usdcMint = mint.toBase58();
    const body = { usdcBalance: raw, usdcMint };
    await redis.setex(cacheKey, CACHE_TTL_SEC, JSON.stringify(body));
    return jsonOk({ walletAddress: wallet, ...body });
  } catch (e) {
    return jsonError(e);
  }
}
