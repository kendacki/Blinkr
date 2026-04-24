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
    #[msg("Relayer signature does not verify over the claim message")]
    InvalidRelayerSignature,
    #[msg("Relayer authorization has expired (slot)")]
    AuthorizationExpired,
    #[msg("Escrow expiry is too far in the future")]
    ExpiryTooLong,
    #[msg("Signer is not the authorized relayer")]
    UnauthorizedRelayer,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Token mint or account does not match the expected USDC context")]
    InvalidMint,
}
