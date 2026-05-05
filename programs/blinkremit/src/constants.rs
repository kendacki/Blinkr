use anchor_lang::prelude::*;
use anchor_spl::token;

pub const ESCROW_SEED: &[u8] = b"escrow";
pub const USDC_DECIMALS: u8 = 6;
/// Maximum on-chain escrow lifetime (7 days) in seconds.
pub const MAX_ESCROW_TTL_SECS: i64 = 604_800;
/// Devnet USDC mint (Circle test token) for BlinkRemit escrows on devnet.
/// For mainnet, replace with `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` before production deploy.
pub const EXPECTED_USDC_MINT: Pubkey = pubkey!("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU");
/// Canonical token program for USDC mint above (legacy SPL Token).
pub const EXPECTED_TOKEN_PROGRAM: Pubkey = token::ID;

/// Relayer identity for `claim_escrow` (must match backend `RELAYER_PUBKEY` / signer).
/// Replace with your deploy relayer pubkey before mainnet.
pub const EXPECTED_RELAYER: Pubkey = pubkey!("D5bToaseZ3UvG1ZyEHh3x9SBo79VLfCunnsbQBtHW7c");
