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

/** Blink row stores the claim wallet; derivation must use the same email source(s) as verify-code / credential. */
export type BlinkCustodialWalletLookup = {
  walletAddress: string | null;
  contractorEmail: string;
  credential: { email: string } | null;
};

/**
 * Returns the custodial keypair that controls `blink.walletAddress`, or null if
 * no configured email derives to that pubkey (true legacy random wallets).
 */
export function resolveCustodialSignerForBlinkWallet(
  blink: BlinkCustodialWalletLookup
): Keypair | null {
  const target = blink.walletAddress;
  if (!target) {
    return null;
  }
  const emails = new Set<string>();
  const credEmail = blink.credential?.email?.trim().toLowerCase();
  if (credEmail) {
    emails.add(credEmail);
  }
  emails.add(blink.contractorEmail.trim().toLowerCase());
  for (const emailNorm of emails) {
    try {
      const kp = deriveContractorWalletKeypair(emailNorm);
      if (kp.publicKey.toBase58() === target) {
        return kp;
      }
    } catch {
      // Misconfigured secret or bad email — try other email if any
    }
  }
  return null;
}
