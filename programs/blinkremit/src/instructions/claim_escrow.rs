use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use solana_sha256_hasher::hash;

use crate::constants::{ESCROW_SEED, USDC_DECIMALS};
use crate::error::BlinkRemitError;
use crate::state::{EscrowAccount, EscrowStatus};
use crate::EscrowClaimed;

#[derive(Accounts)]
pub struct ClaimEscrow<'info> {
    /// Relayer / fee payer submitting the claim on behalf of the contractor.
    pub relayer: Signer<'info>,
    #[account(
        mut,
        seeds = [ESCROW_SEED, escrow.employer.as_ref(), escrow.blink_id.as_ref()],
        bump = escrow.bump,
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
        token::token_program = token_program,
    )]
    pub contractor_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
}

pub fn handle_claim_escrow(
    ctx: Context<ClaimEscrow>,
    contractor_wallet: Pubkey,
    webauthn_proof: [u8; 64],
) -> Result<()> {
    require!(
        ctx.accounts.usdc_mint.decimals == USDC_DECIMALS,
        BlinkRemitError::InvalidMint
    );
    require!(
        ctx.accounts.contractor_token_account.owner == contractor_wallet,
        BlinkRemitError::InvalidMint
    );

    let now = Clock::get()?.unix_timestamp;
    {
        let escrow = &mut ctx.accounts.escrow;
        require!(
            escrow.status == EscrowStatus::Pending,
            BlinkRemitError::AlreadyClaimed
        );
        require!(now < escrow.expires_at, BlinkRemitError::Expired);

        let provided_hash = hash(webauthn_proof.as_ref()).to_bytes();
        require!(
            provided_hash == escrow.credential_hash,
            BlinkRemitError::InvalidCredential
        );

        escrow.contractor_wallet = Some(contractor_wallet);
        escrow.status = EscrowStatus::Claimed;
    }

    let amount = ctx.accounts.escrow.amount;
    let blink_id = ctx.accounts.escrow.blink_id;
    let employer_key = ctx.accounts.escrow.employer;
    let bump = ctx.accounts.escrow.bump;
    let seeds: &[&[u8]] = &[ESCROW_SEED, employer_key.as_ref(), blink_id.as_ref(), &[bump]];
    let signer = &[seeds];

    let cpi_accounts = TransferChecked {
        from: ctx.accounts.escrow_token_account.to_account_info(),
        mint: ctx.accounts.usdc_mint.to_account_info(),
        to: ctx.accounts.contractor_token_account.to_account_info(),
        authority: ctx.accounts.escrow.to_account_info(),
    };
    let cpi_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.key(),
        cpi_accounts,
        signer,
    );
    token_interface::transfer_checked(cpi_ctx, amount, USDC_DECIMALS)?;

    emit!(EscrowClaimed {
        contractor_wallet,
        amount,
    });
    Ok(())
}
