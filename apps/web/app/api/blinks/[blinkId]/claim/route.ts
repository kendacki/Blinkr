import { createHash } from "crypto";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { PublicKey, Transaction, TransactionInstruction } from "@solana/web3.js";
import { NextRequest } from "next/server";
import { verifyContractorSession } from "@/lib/auth";
import { assertBlinkTransition } from "@/lib/blinkStateMachine";
import { buildClaimAuthorizationMessage } from "@/lib/claimMessage";
import { buildClaimEscrowInstruction } from "@/lib/claimInstruction";
import { decodeEscrowClaimNonce } from "@/lib/decodedEscrow";
import { getConnection, getProgramId } from "@/lib/anchor";
import { ApiError, jsonError, jsonOk } from "@/lib/http";
import { prisma } from "@/lib/prisma";
import {
  assertRelayerMatchesProgramConstant,
  loadRelayerKeypair,
  signClaimAuthorizationMessage,
} from "@/lib/relayer";
import { blinkDbIdToBytes } from "@/lib/solana";

export const runtime = "nodejs";

const SLOT_AUTH_WINDOW = 150n;

export async function POST(req: NextRequest, { params }: { params: { blinkId: string } }) {
  try {
    const session = await verifyContractorSession(req.headers.get("authorization"), params.blinkId);

    const blink = await prisma.blink.findUnique({
      where: { id: params.blinkId },
      include: { employer: true, credential: true },
    });
    if (!blink) {
      throw new ApiError(404, "NOT_FOUND", "Blink not found");
    }
    if (blink.status === "CLAIMED" && blink.claimTxSig) {
      return jsonOk({ claimTxSig: blink.claimTxSig, status: "CLAIMED" as const });
    }
    if (blink.status !== "OPENED" || !blink.walletAddress || !blink.escrowPDA || !blink.credentialId) {
      throw new ApiError(400, "INVALID_STATE", "Blink must be OPENED with wallet and credential before claim");
    }
    if (!blink.credential) {
      throw new ApiError(500, "CONFIG", "Credential missing for Blink");
    }

    if (session.walletAddress !== blink.walletAddress) {
      throw new ApiError(403, "FORBIDDEN", "Session wallet does not match Blink wallet");
    }

    const connection = getConnection();
    const programId = getProgramId();
    const usdcMint = new PublicKey(process.env.USDC_MINT_ADDRESS ?? "");
    const escrowPk = new PublicKey(blink.escrowPDA);
    const contractor = new PublicKey(blink.walletAddress);

    const escrowInfo = await connection.getAccountInfo(escrowPk);
    if (!escrowInfo?.data) {
      throw new ApiError(404, "NOT_FOUND", "Escrow account not found on-chain");
    }
    const claimNonce = decodeEscrowClaimNonce(Buffer.from(escrowInfo.data));

    const blinkIdBytes = blinkDbIdToBytes(blink.id);
    const currentSlot = BigInt(await connection.getSlot("confirmed"));
    const expirySlot = currentSlot + SLOT_AUTH_WINDOW;
    const message = buildClaimAuthorizationMessage({
      blinkIdBytes,
      contractorWallet: contractor,
      claimNonce,
      expirySlot,
    });

    const relayerKp = loadRelayerKeypair();
    assertRelayerMatchesProgramConstant(relayerKp);
    const relayerSig = signClaimAuthorizationMessage(relayerKp.secretKey, message);

    const credHash = createHash("sha256")
      .update(Buffer.from(blink.credential.credentialId, "utf8"))
      .digest();

    const escrowToken = getAssociatedTokenAddressSync(usdcMint, escrowPk, true);
    const contractorToken = getAssociatedTokenAddressSync(usdcMint, contractor, false);

    const ixs: TransactionInstruction[] = [];
    const contractorInfo = await connection.getAccountInfo(contractorToken);
    if (!contractorInfo) {
      ixs.push(
        createAssociatedTokenAccountIdempotentInstruction(
          relayerKp.publicKey,
          contractorToken,
          contractor,
          usdcMint,
        ),
      );
    }

    ixs.push(
      buildClaimEscrowInstruction({
        programId,
        relayer: relayerKp.publicKey,
        escrow: escrowPk,
        usdcMint,
        escrowToken,
        contractorToken,
        contractorWallet: contractor,
        credentialHash: credHash,
        expirySlot,
        relayerSig,
      }),
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({ feePayer: relayerKp.publicKey, recentBlockhash: blockhash });
    tx.add(...ixs);
    tx.sign(relayerKp);

    const sig = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    await connection.confirmTransaction({ signature: sig, blockhash, lastValidBlockHeight }, "confirmed");

    assertBlinkTransition(blink.status, "CLAIMED");
    await prisma.blink.update({
      where: { id: blink.id },
      data: {
        status: "CLAIMED",
        claimTxSig: sig,
        claimedAt: new Date(),
      },
    });

    return jsonOk({ claimTxSig: sig, status: "CLAIMED" as const });
  } catch (e) {
    return jsonError(e);
  }
}
