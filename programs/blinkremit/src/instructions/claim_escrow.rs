use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use ed25519_dalek::{Signature, Verifier, VerifyingKey};

use crate::constants::{ESCROW_SEED, EXPECTED_RELAYER, USDC_DECIMALS};
use crate::error::BlinkRemitError;
use crate::state::{EscrowAccount, EscrowStatus};
use crate::EscrowClaimed;

#[derive(Accounts)]
pub struct ClaimEscrow<'info> {
    #[account(mut, signer, constraint = relayer.key() == EXPECTED_RELAYER @ BlinkRemitError::UnauthorizedRelayer)]
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
    credential_hash: [u8; 32],
    expiry_slot: u64,
    relayer_sig: [u8; 64],
) -> Result<()> {
    require!(
        ctx.accounts.usdc_mint.decimals == USDC_DECIMALS,
        BlinkRemitError::InvalidMint
    );
    require!(
        ctx.accounts.contractor_token_account.owner == contractor_wallet,
        BlinkRemitError::InvalidMint
    );

    let clock = Clock::get()?;
    require!(clock.slot <= expiry_slot, BlinkRemitError::AuthorizationExpired);

    let mut msg = Vec::with_capacity(104);
    {
        let escrow = &ctx.accounts.escrow;
        require!(
            escrow.status == EscrowStatus::Pending,
            BlinkRemitError::AlreadyClaimed
        );
        require!(
            clock.unix_timestamp < escrow.expires_at,
            BlinkRemitError::Expired
        );
        msg.extend_from_slice(&escrow.blink_id);
        msg.extend_from_slice(contractor_wallet.as_ref());
        msg.extend_from_slice(&escrow.claim_nonce);
        msg.extend_from_slice(&expiry_slot.to_le_bytes());
    }

    let vk = VerifyingKey::from_bytes(&ctx.accounts.relayer.key().to_bytes())
        .map_err(|_| error!(BlinkRemitError::InvalidRelayerSignature))?;
    let sig = Signature::from_slice(&relayer_sig)
        .map_err(|_| error!(BlinkRemitError::InvalidRelayerSignature))?;
    vk.verify(msg.as_slice(), &sig)
        .map_err(|_| error!(BlinkRemitError::InvalidRelayerSignature))?;

    let amount = ctx.accounts.escrow.amount;
    let blink_id = ctx.accounts.escrow.blink_id;
    let employer_key = ctx.accounts.escrow.employer;
    let bump = ctx.accounts.escrow.bump;

    {
        let escrow = &mut ctx.accounts.escrow;
        escrow.contractor_wallet = Some(contractor_wallet);
        escrow.credential_hash = credential_hash;
        escrow.status = EscrowStatus::Claimed;
    }

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
