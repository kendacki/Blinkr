import { Keypair } from "@solana/web3.js";
import * as jose from "jose";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { POST as createBlinkPOST } from "@/app/api/blinks/create/route";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => {
  const employer = { upsert: vi.fn() };
  const blink = { create: vi.fn(), update: vi.fn() };
  return { prisma: { employer, blink } };
});

describe("POST /api/blinks/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 401 without Authorization", async () => {
    const wallet = Keypair.generate().publicKey.toBase58();
    const req = new NextRequest("http://localhost/api/blinks/create", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        contractorEmail: "c@example.com",
        amountUsdc: "1.000000",
        employerWallet: wallet,
      }),
    });
    const res = await createBlinkPOST(req);
    expect(res.status).toBe(401);
  });

  it("returns 200 with blinkUrl and escrowPDA when JWT matches wallet", async () => {
    const wallet = Keypair.generate().publicKey.toBase58();
    const secret = new TextEncoder().encode(process.env.JWT_SECRET ?? "");
    const token = await new jose.SignJWT({ walletAddress: wallet })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1h")
      .sign(secret);

    vi.mocked(prisma.employer.upsert).mockResolvedValue({ id: "emp1" } as never);
    vi.mocked(prisma.blink.create).mockResolvedValue({ id: "blink-db-id-1" } as never);
    vi.mocked(prisma.blink.update).mockResolvedValue({} as never);

    const req = new NextRequest("http://localhost/api/blinks/create", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        contractorEmail: "c@example.com",
        amountUsdc: "1000.00",
        employerWallet: wallet,
      }),
    });
    const res = await createBlinkPOST(req);
    expect(res.status).toBe(200);
    const data = (await res.json()) as {
      blinkId: string;
      blinkUrl: string;
      escrowPDA: string;
    };
    expect(data.blinkId).toBe("blink-db-id-1");
    expect(data.blinkUrl).toContain("/blink/blink-db-id-1");
    expect(data.escrowPDA.length).toBeGreaterThan(30);
  });
});
