use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct EscrowAccount {
    pub employer: Pubkey,
    pub amount: u64,
    pub blink_id: [u8; 32],
    pub credential_hash: [u8; 32],
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
