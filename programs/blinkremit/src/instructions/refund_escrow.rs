use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};

use crate::constants::{ESCROW_SEED, EXPECTED_TOKEN_PROGRAM, EXPECTED_USDC_MINT, USDC_DECIMALS};
use crate::error::BlinkRemitError;
use crate::state::{EscrowAccount, EscrowStatus};
use crate::EscrowRefunded;

#[derive(Accounts)]
pub struct RefundEscrow<'info> {
    #[account(mut)]
    pub employer: Signer<'info>,
    #[account(
        mut,
        seeds = [ESCROW_SEED, escrow.employer.as_ref(), escrow.blink_id.as_ref()],
        bump = escrow.bump,
        has_one = employer @ BlinkRemitError::Unauthorized,
    )]
    pub escrow: Account<'info, EscrowAccount>,
    pub usdc_mint: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        token::mint = usdc_mint,
        token::authority = escrow,
        token::token_program = token_program,
    )]
    pub escrow_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(
        mut,
        token::mint = usdc_mint,
        token::authority = employer,
        token::token_program = token_program,
    )]
    pub employer_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handle_refund_escrow(ctx: Context<RefundEscrow>) -> Result<()> {
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

    let (amount, blink_id, employer_key, bump) = {
        let escrow = &mut ctx.accounts.escrow;
        require!(
            escrow.status == EscrowStatus::Pending,
            BlinkRemitError::AlreadyClaimed
        );
        require!(
            escrow.usdc_mint == ctx.accounts.usdc_mint.key(),
            BlinkRemitError::InvalidUsdcMint
        );
        require!(
            escrow.token_program == ctx.accounts.token_program.key(),
            BlinkRemitError::InvalidTokenProgram
        );
        require!(
            escrow.escrow_token_account == ctx.accounts.escrow_token_account.key(),
            BlinkRemitError::InvalidEscrowVault
        );
        let amount = escrow.amount;
        let blink_id = escrow.blink_id;
        let employer_key = escrow.employer;
        let bump = escrow.bump;
        escrow.status = EscrowStatus::Refunded;
        (amount, blink_id, employer_key, bump)
    };

    let seeds: &[&[u8]] = &[ESCROW_SEED, employer_key.as_ref(), blink_id.as_ref(), &[bump]];
    let signer = &[seeds];

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        mint: ctx.accounts.usdc_mint.to_account_info(),
        to: ctx.accounts.employer_token_account.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.key(),
        cpi_accounts,
        signer,
    );
    token_interface::transfer_checked(cpi_ctx, amount, USDC_DECIMALS)?;

    emit!(EscrowRefunded {
        blink_id,
        amount,
        usdc_mint: ctx.accounts.usdc_mint.key(),
    });
    Ok(())
}
