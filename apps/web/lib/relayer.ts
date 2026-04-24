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
  if (kp.publicKey.toBase58() !== expected) {
    throw new Error("RELAYER_KEYPAIR public key does not match RELAYER_PUBKEY / on-chain EXPECTED_RELAYER");
  }
}

export function signClaimAuthorizationMessage(secretKey: Uint8Array, message: Buffer): Buffer {
  return Buffer.from(nacl.sign.detached(message, secretKey));
}
