import { Keypair } from "@solana/web3.js";
import nacl from "tweetnacl";

export function loadRelayerKeypair(): Keypair {
  const raw = process.env.RELAYER_KEYPAIR;
  if (!raw?.trim()) {
    throw new Error("RELAYER_KEYPAIR is not set");
  }
  const parsed = JSON.parse(raw) as number[];
  if (!Array.isArray(parsed) || parsed.length < 32) {
    throw new Error("RELAYER_KEYPAIR must be a JSON array of secret key bytes");
  }
  return Keypair.fromSecretKey(Uint8Array.from(parsed));
}

export function assertRelayerMatchesProgramConstant(kp: Keypair): void {
  const expected = process.env.RELAYER_PUBKEY;
  if (!expected) {
    return;
  }
  const actual = kp.publicKey.toBase58();
  if (actual !== expected) {
    throw new Error(
      `RELAYER_KEYPAIR pubkey (${actual}) does not match RELAYER_PUBKEY (${expected}). ` +
        "Use the same keypair file for RELAYER_KEYPAIR as the pubkey in RELAYER_PUBKEY, and ensure " +
        "RELAYER_PUBKEY matches EXPECTED_RELAYER in programs/blinkremit/src/constants.rs for the deployed program."
    );
  }
}

export function signClaimAuthorizationMessage(
  secretKey: Uint8Array,
  message: Buffer
): Buffer {
  return Buffer.from(nacl.sign.detached(message, secretKey));
}
