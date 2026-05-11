import { createHash } from "crypto";
import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

/**
 * Deterministic custodial Solana keypair per contractor email so the server can
 * sign SPL transfers after a simulated off-ramp (Stripe). Never log the secret.
 */
export function deriveContractorWalletKeypair(emailNorm: string): Keypair {
  const secret = process.env.CONTRACTOR_WALLET_DERIVATION_SECRET ?? "";
  if (secret.length < 32) {
    throw new Error(
      "CONTRACTOR_WALLET_DERIVATION_SECRET must be set to at least 32 characters"
    );
  }
  const seed = createHash("sha256")
    .update(secret, "utf8")
    .update("|", "utf8")
    .update(emailNorm, "utf8")
    .digest();
  const pair = nacl.sign.keyPair.fromSeed(seed);
  return Keypair.fromSecretKey(pair.secretKey);
}

export function contractorWalletMatchesDerivation(
  emailNorm: string,
  walletAddress: string
): boolean {
  try {
    return (
      deriveContractorWalletKeypair(emailNorm).publicKey.toBase58() ===
      walletAddress
    );
  } catch {
    return false;
  }
}
