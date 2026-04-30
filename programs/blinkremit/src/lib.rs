pub mod constants;
pub mod error;
pub mod instructions;
pub mod state;

use anchor_lang::prelude::*;

pub use constants::*;
pub use instructions::*;
pub use state::*;

declare_id!("7A2de9YeGGMiLtiBBQYELVZyXTA5YCnUdGts9un9aCxa");

#[program]
pub mod blinkremit {
    use super::*;

    pub fn create_escrow(
        ctx: Context<CreateEscrow>,
        blink_id: [u8; 32],
        amount: u64,
        expires_at: i64,
    ) -> Result<()> {
        instructions::create_escrow::handle_create_escrow(ctx, blink_id, amount, expires_at)
    }

    pub fn claim_escrow(
        ctx: Context<ClaimEscrow>,
        contractor_wallet: Pubkey,
        credential_hash: [u8; 32],
        expiry_slot: u64,
        relayer_sig: [u8; 64],
    ) -> Result<()> {
        instructions::claim_escrow::handle_claim_escrow(
            ctx,
            contractor_wallet,
            credential_hash,
            expiry_slot,
            relayer_sig,
        )
    }

    pub fn refund_escrow(ctx: Context<RefundEscrow>) -> Result<()> {
        instructions::refund_escrow::handle_refund_escrow(ctx)
    }
}

#[event]
pub struct EscrowCreated {
    pub blink_id: [u8; 32],
    pub amount: u64,
    pub employer: Pubkey,
    pub usdc_mint: Pubkey,
}

#[event]
pub struct EscrowClaimed {
    pub blink_id: [u8; 32],
    pub contractor_wallet: Pubkey,
    pub amount: u64,
    pub usdc_mint: Pubkey,
}

#[event]
pub struct EscrowRefunded {
    pub blink_id: [u8; 32],
    pub amount: u64,
    pub usdc_mint: Pubkey,
}
