import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";

import { getConnection } from "@/lib/anchor";
import { loadRelayerKeypair } from "@/lib/relayer";
import { getMintOwnerProgram } from "@/lib/tokenProgram";

const USDC_DECIMALS = 6;

/**
 * Move all USDC from the contractor's ATA to the treasury owner's ATA.
 * Relayer pays tx fee and creates treasury ATA if missing. Contractor must sign the transfer.
 */
export async function sweepContractorUsdcToTreasury(params: {
  contractorSigner: Keypair;
  treasuryOwner: PublicKey;
}): Promise<{ sweepTxSig: string | null; amountRaw: bigint }> {
  const connection = getConnection();
  const relayer = loadRelayerKeypair();
  const mint = new PublicKey(process.env.USDC_MINT_ADDRESS ?? "");
  const tokenProgram = await getMintOwnerProgram(connection, mint);
  const contractorPub = params.contractorSigner.publicKey;

  const sourceAta = getAssociatedTokenAddressSync(
    mint,
    contractorPub,
    false,
    tokenProgram
  );
  const destAta = getAssociatedTokenAddressSync(
    mint,
    params.treasuryOwner,
    false,
    tokenProgram
  );

  const acc = await getAccount(connection, sourceAta, "confirmed", tokenProgram);
  const amountRaw = acc.amount;
  if (amountRaw === 0n) {
    return { sweepTxSig: null, amountRaw: 0n };
  }

  const ixs = [];
  const destInfo = await connection.getAccountInfo(destAta, "confirmed");
  if (!destInfo) {
    ixs.push(
      createAssociatedTokenAccountIdempotentInstruction(
        relayer.publicKey,
        destAta,
        params.treasuryOwner,
        mint,
        tokenProgram
      )
    );
  }

  ixs.push(
    createTransferCheckedInstruction(
      sourceAta,
      mint,
      destAta,
      contractorPub,
      amountRaw,
      USDC_DECIMALS,
      [],
      tokenProgram
    )
  );

  const { blockhash, lastValidBlockHeight } =
    await connection.getLatestBlockhash("confirmed");
  const tx = new Transaction({
    feePayer: relayer.publicKey,
    recentBlockhash: blockhash,
  });
  tx.add(...ixs);
  tx.partialSign(params.contractorSigner);
  tx.sign(relayer);

  const sig = await connection.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });
  await connection.confirmTransaction(
    { signature: sig, blockhash, lastValidBlockHeight },
    "confirmed"
  );
  return { sweepTxSig: sig, amountRaw };
}
