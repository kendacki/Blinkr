import { Prisma } from "@prisma/client";
import { PublicKey } from "@solana/web3.js";
import { NextRequest } from "next/server";
import { verifyEmployerJwt } from "@/lib/auth";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { createBlinkBodySchema } from "@/lib/schemas";
import { blinkDbIdToBytes, getEscrowPDA } from "@/lib/solana";

export const runtime = "nodejs";

const BLINK_TTL_DAYS = 7;

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const body = createBlinkBodySchema.parse(json);
    await verifyEmployerJwt(req.headers.get("authorization"), body.employerWallet);

    const employerRecord = await prisma.employer.upsert({
      where: { walletAddress: body.employerWallet },
      create: { walletAddress: body.employerWallet },
      update: {},
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + BLINK_TTL_DAYS);

    const blink = await prisma.blink.create({
      data: {
        employerId: employerRecord.id,
        contractorEmail: body.contractorEmail,
        amountUsdc: new Prisma.Decimal(body.amountUsdc),
        expiresAt,
      },
    });

    const programId = new PublicKey(process.env.PROGRAM_ID ?? "");
    const employerPk = new PublicKey(body.employerWallet);
    const blinkBytes = blinkDbIdToBytes(blink.id);
    const [escrowPDA] = getEscrowPDA(programId, employerPk, blinkBytes);

    const baseUrl = (process.env.NEXT_PUBLIC_URL ?? "").replace(/\/$/, "");
    const blinkUrl = `${baseUrl}/blink/${blink.id}`;

    await prisma.blink.update({
      where: { id: blink.id },
      data: { escrowPDA: escrowPDA.toBase58() },
    });

    return jsonOk({
      blinkId: blink.id,
      blinkUrl,
      escrowPDA: escrowPDA.toBase58(),
      serializedTxAcknowledged: Boolean(body.serializedTx),
    });
  } catch (e) {
    return jsonError(e);
  }
}
