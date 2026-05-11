import { deriveContractorWalletKeypair } from "@/lib/deriveContractorWallet";
import { prisma } from "@/lib/prisma";

/**
 * If this credential still uses a legacy random wallet and no Blink has claimed
 * on-chain yet for this identity, move the credential (and all open Blinks) to the
 * deterministic derived wallet so claim + Stripe sweep can be signed server-side.
 */
export async function migrateCredentialToDerivedWalletIfSafe(
  credentialId: string,
  emailNorm: string
): Promise<boolean> {
  let derivedPub: string;
  try {
    derivedPub = deriveContractorWalletKeypair(emailNorm).publicKey.toBase58();
  } catch {
    return false;
  }

  const cred = await prisma.credential.findUnique({ where: { id: credentialId } });
  if (!cred || cred.walletAddress === derivedPub) {
    return false;
  }

  const anyClaimed = await prisma.blink.findFirst({
    where: { credentialId, claimTxSig: { not: null } },
  });
  if (anyClaimed) {
    return false;
  }

  await prisma.$transaction([
    prisma.credential.update({
      where: { id: credentialId },
      data: { walletAddress: derivedPub },
    }),
    prisma.blink.updateMany({
      where: {
        credentialId,
        claimTxSig: null,
        status: { notIn: ["CLAIMED", "OFFRAMPED", "REFUNDED"] },
      },
      data: { walletAddress: derivedPub },
    }),
  ]);

  return true;
}
