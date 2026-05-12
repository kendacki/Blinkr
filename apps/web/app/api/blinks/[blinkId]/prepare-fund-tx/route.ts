import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PublicKey, Transaction } from "@solana/web3.js";
import { NextRequest } from "next/server";
import { getConnection, getProgramId } from "@/lib/anchor";
import { verifyEmployerJwt } from "@/lib/auth";
import { buildCreateEscrowInstruction } from "@/lib/createEscrowInstruction";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import { amountToLamports, blinkDbIdToBytes, getEscrowPDA } from "@/lib/solana";
import { getMintOwnerProgram } from "@/lib/tokenProgram";

export const runtime = "nodejs";

export async function POST(
  req: NextRequest,
  { params }: { params: { blinkId: string } }
) {
  try {
    const blink = await prisma.blink.findUnique({
      where: { id: params.blinkId },
      include: { employer: true },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    if (blink.escrowTxSig) {
      throw new ApiError(
        400,
        "INVALID_STATE",
        "This Blink already has a recorded fund transaction"
      );
    }
    if (blink.status !== "PENDING" && blink.status !== "OPENED") {
      throw new ApiError(
        400,
        "INVALID_STATE",
        "Fund is only available while the Blink is pending or opened and not yet funded on-chain"
      );
    }

    await verifyEmployerJwt(
      req.headers.get("authorization"),
      blink.employer.walletAddress
    );

    const programId = getProgramId();
    const connection = getConnection();
    const employer = new PublicKey(blink.employer.walletAddress);
    const usdcMint = new PublicKey(process.env.USDC_MINT_ADDRESS ?? "");
    const blinkBytes = blinkDbIdToBytes(blink.id);
    const [escrowPda] = getEscrowPDA(programId, employer, blinkBytes);
    if (blink.escrowPDA && escrowPda.toBase58() !== blink.escrowPDA) {
      throw new ApiError(500, "CONFIG", "Escrow PDA mismatch; contact support");
    }

    const existingEscrow = await connection.getAccountInfo(escrowPda, "confirmed");
    if (existingEscrow && existingEscrow.owner.equals(programId)) {
      throw new ApiError(
        400,
        "ESCROW_EXISTS",
        "Escrow already exists on-chain. If your dashboard does not show it as funded, use confirm escrow with your transaction signature or contact support."
      );
    }

    const tokenProgram = await getMintOwnerProgram(connection, usdcMint);
    const employerAta = getAssociatedTokenAddressSync(
      usdcMint,
      employer,
      false,
      tokenProgram,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );
    const escrowAta = getAssociatedTokenAddressSync(
      usdcMint,
      escrowPda,
      true,
      tokenProgram,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const amountLamports = amountToLamports(blink.amountUsdc.toString());
    const expiresAtUnix = BigInt(Math.floor(blink.expiresAt.getTime() / 1000));

    const ix = buildCreateEscrowInstruction({
      programId,
      employer,
      escrow: escrowPda,
      usdcMint,
      employerTokenAccount: employerAta,
      escrowTokenAccount: escrowAta,
      tokenProgram,
      blinkIdBytes: blinkBytes,
      amountLamports,
      expiresAtUnix,
    });

    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({
      feePayer: employer,
      recentBlockhash: blockhash,
    });
    tx.add(ix);

    const serialized = tx.serialize({
      requireAllSignatures: false,
      verifySignatures: false,
    });
    return jsonOk({
      serializedTxBase64: serialized.toString("base64"),
      escrowPDA: escrowPda.toBase58(),
      blockhash,
      lastValidBlockHeight,
    });
  } catch (e) {
    return jsonError(e);
  }
}
