use anchor_lang::prelude::*;
use solana_sha256_hasher::hash;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked},
};

use crate::constants::{
    ESCROW_SEED, EXPECTED_TOKEN_PROGRAM, EXPECTED_USDC_MINT, MAX_ESCROW_TTL_SECS, USDC_DECIMALS,
};
use crate::error::BlinkRemitError;
use crate::state::{EscrowAccount, EscrowStatus};
use crate::EscrowCreated;

#[derive(Accounts)]
#[instruction(blink_id: [u8; 32])]
pub struct CreateEscrow<'info> {
    #[account(mut)]
    pub employer: Signer<'info>,
    #[account(
        init,
        payer = employer,
        space = 8 + EscrowAccount::INIT_SPACE,
        seeds = [ESCROW_SEED, employer.key().as_ref(), blink_id.as_ref()],
        bump
    )]
    pub escrow: Account<'info, EscrowAccount>,
    pub usdc_mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        token::mint = usdc_mint,
        token::authority = employer,
        token::token_program = token_program,
    )]
    pub employer_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init_if_needed,
        payer = employer,
        associated_token::mint = usdc_mint,
        associated_token::authority = escrow,
        associated_token::token_program = token_program,
    )]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handle_create_escrow(
    ctx: Context<CreateEscrow>,
    blink_id: [u8; 32],
    amount: u64,
    expires_at: i64,
) -> Result<()> {
    require!(amount > 0, BlinkRemitError::InvalidAmount);
    let now = Clock::get()?.unix_timestamp;
    let slot = Clock::get()?.slot;
    require!(expires_at > now, BlinkRemitError::InvalidExpiry);
    require!(
        expires_at <= now + MAX_ESCROW_TTL_SECS,
        BlinkRemitError::ExpiryTooLong
    );
    require!(
        ctx.accounts.usdc_mint.decimals == USDC_DECIMALS,
        BlinkRemitError::InvalidMint
    );
    require!(
        ctx.accounts.usdc_mint.key() == EXPECTED_USDC_MINT,
        BlinkRemitError::InvalidUsdcMint
    );
    require!(
        ctx.accounts.token_program.key() == EXPECTED_TOKEN_PROGRAM,
        BlinkRemitError::InvalidTokenProgram
    );

    // Bind nonce to employer so the same (blink_id, slot) cannot collide across employers (replay isolation).
    let mut nonce_input = Vec::with_capacity(32 + 32 + 8);
    nonce_input.extend_from_slice(&blink_id);
    nonce_input.extend_from_slice(ctx.accounts.employer.key().as_ref());
    nonce_input.extend_from_slice(&slot.to_le_bytes());
    let claim_nonce = hash(&nonce_input).to_bytes();

    let escrow = &mut ctx.accounts.escrow;
    escrow.employer = ctx.accounts.employer.key();
    escrow.usdc_mint = ctx.accounts.usdc_mint.key();
    escrow.token_program = ctx.accounts.token_program.key();
    escrow.escrow_token_account = ctx.accounts.escrow_token_account.key();
    escrow.amount = amount;
    escrow.blink_id = blink_id;
    escrow.credential_hash = [0u8; 32];
    escrow.claim_nonce = claim_nonce;
    escrow.contractor_wallet = None;
    escrow.status = EscrowStatus::Pending;
    escrow.created_at = now;
    escrow.expires_at = expires_at;
    escrow.bump = ctx.bumps.escrow;

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.employer_token_account.to_account_info(),
        mint: ctx.accounts.usdc_mint.to_account_info(),
        to: ctx.accounts.escrow_token_account.to_account_info(),
        authority: ctx.accounts.employer.to_account_info(),
    };
    let cpi_ctx = CpiContext::new(
        ctx.accounts.token_program.key(),
        cpi_accounts,
    );
    token_interface::transfer_checked(cpi_ctx, amount, USDC_DECIMALS)?;

    emit!(EscrowCreated {
        blink_id,
        amount,
        employer: ctx.accounts.employer.key(),
        usdc_mint: ctx.accounts.usdc_mint.key(),
    });
    Ok(())
}
