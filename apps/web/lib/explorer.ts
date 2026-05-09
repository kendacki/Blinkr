function clusterQuerySuffix(): string {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_CLUSTER ?? "devnet";
  const isMain =
    cluster === "mainnet-beta" ||
    cluster === "mainnet" ||
    cluster === "mainnet-beta";
  return isMain ? "" : `?cluster=${encodeURIComponent(cluster)}`;
}

/** Solana Explorer URL for an address. */
export function solanaAddressExplorerUrl(address: string): string {
  return `https://explorer.solana.com/address/${encodeURIComponent(
    address
  )}${clusterQuerySuffix()}`;
}

/** Solana Explorer URL for a transaction signature. */
export function solanaTxExplorerUrl(signature: string): string {
  return `https://explorer.solana.com/tx/${encodeURIComponent(
    signature
  )}${clusterQuerySuffix()}`;
}
