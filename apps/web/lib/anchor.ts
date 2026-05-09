import { Connection, PublicKey } from "@solana/web3.js";
import { blinkDbIdToBytes, getEscrowPDA } from "@/lib/solana";

export function getConnection(): Connection {
  const url = process.env.SOLANA_RPC_URL;
  if (!url) {
    throw new Error("SOLANA_RPC_URL is not set");
  }
  return new Connection(url, "confirmed");
}

export function getProgramId(): PublicKey {
  return new PublicKey(process.env.PROGRAM_ID ?? "");
}

export function escrowPdaForBlink(
  employerWallet: string,
  blinkDbId: string
): PublicKey {
  const programId = getProgramId();
  const employer = new PublicKey(employerWallet);
  const blinkBytes = blinkDbIdToBytes(blinkDbId);
  const [pda] = getEscrowPDA(programId, employer, blinkBytes);
  return pda;
}
