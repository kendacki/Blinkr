use anchor_lang::prelude::*;
use anchor_spl::token;

pub const ESCROW_SEED: &[u8] = b"escrow";
pub const USDC_DECIMALS: u8 = 6;
/// Maximum on-chain escrow lifetime (7 days) in seconds.
pub const MAX_ESCROW_TTL_SECS: i64 = 604_800;
/// Canonical mainnet USDC mint for BlinkRemit escrows.
pub const EXPECTED_USDC_MINT: Pubkey = pubkey!("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
/// Canonical token program for USDC mint above (legacy SPL Token).
pub const EXPECTED_TOKEN_PROGRAM: Pubkey = token::ID;

/// Relayer identity for `claim_escrow` (must match backend `RELAYER_PUBKEY` / signer).
/// Replace with your deploy relayer pubkey before mainnet.
pub const EXPECTED_RELAYER: Pubkey = pubkey!("B6m9QCBw4q6wrvrE4JXKPtFdihFFgFwpAdp4nZcRa3x7");
