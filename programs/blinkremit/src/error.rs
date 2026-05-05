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
    #[msg("Relayer signature does not verify over the claim message")]
    InvalidRelayerSignature,
    #[msg("Missing or malformed Ed25519 verification instruction")]
    MissingEd25519Instruction,
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
    #[msg("Mint does not match the canonical USDC mint")]
    InvalidUsdcMint,
    #[msg("Token program does not match the canonical token program")]
    InvalidTokenProgram,
    #[msg("Contractor token account owner does not match contractor wallet")]
    InvalidContractorTokenAccount,
    #[msg("Escrow vault account does not match the originally funded vault")]
    InvalidEscrowVault,
    #[msg("Refund is only allowed after the escrow claim deadline")]
    RefundBeforeExpiry,
}
