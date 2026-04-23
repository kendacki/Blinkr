use anchor_lang::prelude::*;

#[error_code]
pub enum BlinkRemitError {
    #[msg("Amount must be greater than zero")]
    InvalidAmount,
    #[msg("Expiry must be in the future")]
    InvalidExpiry,
    #[msg("Escrow is not pending or was already settled")]
    AlreadyClaimed,
    #[msg("Escrow has expired")]
    Expired,
    #[msg("Invalid WebAuthn credential proof")]
    InvalidCredential,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Token mint or account does not match the expected USDC context")]
    InvalidMint,
}
