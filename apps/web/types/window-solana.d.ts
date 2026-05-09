export {};

declare global {
  interface Window {
    solana?: {
      isPhantom?: boolean;
      connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{
        publicKey: { toBase58: () => string; toBytes: () => Uint8Array };
      }>;
      signMessage: (
        message: Uint8Array,
        display?: string
      ) => Promise<{ signature: Uint8Array }>;
      signTransaction?: (
        transaction: import("@solana/web3.js").Transaction
      ) => Promise<import("@solana/web3.js").Transaction>;
    };
  }
}
