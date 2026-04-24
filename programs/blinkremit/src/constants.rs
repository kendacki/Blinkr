use anchor_lang::prelude::*;

pub const ESCROW_SEED: &[u8] = b"escrow";
pub const USDC_DECIMALS: u8 = 6;
/// Maximum on-chain escrow lifetime (7 days) in seconds.
pub const MAX_ESCROW_TTL_SECS: i64 = 604_800;

/// Relayer identity for `claim_escrow` (must match backend `RELAYER_PUBKEY` / signer).
/// Replace with your deploy relayer pubkey before mainnet.
pub const EXPECTED_RELAYER: Pubkey = pubkey!("B6m9QCBw4q6wrvrE4JXKPtFdihFFgFwpAdp4nZcRa3x7");
