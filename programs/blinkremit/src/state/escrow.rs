use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct EscrowAccount {
    pub employer: Pubkey,
    pub usdc_mint: Pubkey,
    pub token_program: Pubkey,
    pub escrow_token_account: Pubkey,
    pub amount: u64,
    pub blink_id: [u8; 32],
    /// Filled at successful claim by relayer (WebAuthn credential id hash off-chain).
    pub credential_hash: [u8; 32],
    /// Replay guard: SHA-256(blink_id || create_slot_le_bytes).
    pub claim_nonce: [u8; 32],
    pub contractor_wallet: Option<Pubkey>,
    pub status: EscrowStatus,
    pub created_at: i64,
    pub expires_at: i64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq, InitSpace)]
pub enum EscrowStatus {
    Pending,
    Claimed,
    Refunded,
}
