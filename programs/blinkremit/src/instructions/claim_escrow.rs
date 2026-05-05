use anchor_lang::prelude::*;
use anchor_spl::token_interface::{self, Mint, TokenAccount, TokenInterface, TransferChecked};
use solana_instruction::Instruction;
use solana_instructions_sysvar::{
    self as instruction_sysvar, load_current_index_checked, load_instruction_at_checked,
};
use solana_sdk_ids::ed25519_program;

use crate::constants::{
    ESCROW_SEED, EXPECTED_RELAYER, EXPECTED_TOKEN_PROGRAM, EXPECTED_USDC_MINT, USDC_DECIMALS,
};
use crate::error::BlinkRemitError;
use crate::state::{EscrowAccount, EscrowStatus};
use crate::EscrowClaimed;

#[derive(Accounts)]
pub struct ClaimEscrow<'info> {
    #[account(
        constraint = relayer.key() == EXPECTED_RELAYER @ BlinkRemitError::UnauthorizedRelayer
    )]
    /// CHECK: Relayer identity is constrained to EXPECTED_RELAYER.
    pub relayer: UncheckedAccount<'info>,
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
    /// CHECK: Address is validated against instructions sysvar ID below.
    #[account(address = instruction_sysvar::ID)]
    pub instructions_sysvar: UncheckedAccount<'info>,
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
        ctx.accounts.usdc_mint.key() == EXPECTED_USDC_MINT,
        BlinkRemitError::InvalidUsdcMint
    );
    require!(
        ctx.accounts.token_program.key() == EXPECTED_TOKEN_PROGRAM,
        BlinkRemitError::InvalidTokenProgram
    );
    require!(
        ctx.accounts.contractor_token_account.owner == contractor_wallet,
        BlinkRemitError::InvalidContractorTokenAccount
    );

    let clock = Clock::get()?;
    require!(clock.slot <= expiry_slot, BlinkRemitError::AuthorizationExpired);

    // Relayer-signed payload: domain-separated, bound to this escrow instance and claim parameters.
    // Layout (344 bytes): program_id(32) | escrow(32) | blink_id(32) | employer(32) | contractor(32)
    // | amount(u64 le) | usdc_mint(32) | token_program(32) | escrow_token(32) | expires_at(i64 le)
    // | claim_nonce(32) | credential_hash(32) | expiry_slot(u64 le)
    let mut msg = Vec::with_capacity(344);
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
        msg.extend_from_slice(crate::ID.as_ref());
        msg.extend_from_slice(ctx.accounts.escrow.key().as_ref());
        msg.extend_from_slice(&escrow.blink_id);
        msg.extend_from_slice(escrow.employer.as_ref());
        msg.extend_from_slice(contractor_wallet.as_ref());
        msg.extend_from_slice(&escrow.amount.to_le_bytes());
        msg.extend_from_slice(escrow.usdc_mint.as_ref());
        msg.extend_from_slice(escrow.token_program.as_ref());
        msg.extend_from_slice(escrow.escrow_token_account.as_ref());
        msg.extend_from_slice(&escrow.expires_at.to_le_bytes());
        msg.extend_from_slice(&escrow.claim_nonce);
        msg.extend_from_slice(&credential_hash);
        msg.extend_from_slice(&expiry_slot.to_le_bytes());
    }

    verify_relayer_ed25519_ix(
        &ctx.accounts.instructions_sysvar.to_account_info(),
        &ctx.accounts.relayer.key(),
        msg.as_slice(),
        &relayer_sig,
    )?;

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
        blink_id,
        contractor_wallet,
        amount,
        usdc_mint: ctx.accounts.usdc_mint.key(),
    });
    Ok(())
}

fn verify_relayer_ed25519_ix(
    instructions_sysvar_info: &AccountInfo<'_>,
    relayer: &Pubkey,
    expected_message: &[u8],
    expected_signature: &[u8; 64],
) -> Result<()> {
    let current_ix_index = load_current_index_checked(instructions_sysvar_info)
        .map_err(|_| error!(BlinkRemitError::MissingEd25519Instruction))?;
    require!(
        current_ix_index > 0,
        BlinkRemitError::MissingEd25519Instruction
    );

    let ed25519_ix = load_instruction_at_checked(
        (current_ix_index as usize).saturating_sub(1),
        instructions_sysvar_info,
    )
    .map_err(|_| error!(BlinkRemitError::MissingEd25519Instruction))?;

    require!(
        ed25519_ix.program_id == ed25519_program::id(),
        BlinkRemitError::MissingEd25519Instruction
    );

    assert_ed25519_instruction_data(
        &ed25519_ix,
        relayer.as_ref(),
        expected_message,
        expected_signature,
    )
}

fn assert_ed25519_instruction_data(
    ix: &Instruction,
    expected_pubkey: &[u8],
    expected_message: &[u8],
    expected_signature: &[u8; 64],
) -> Result<()> {
    // Ed25519 instruction format: [num_sigs, padding, offsets..., pubkey, sig, message]
    // where offsets are seven u16 values in little-endian.
    const HEADER_LEN: usize = 16;
    const SIG_LEN: usize = 64;
    const PUBKEY_LEN: usize = 32;

    require!(
        ix.data.len() >= HEADER_LEN && ix.data[0] == 1,
        BlinkRemitError::InvalidRelayerSignature
    );

    let signature_offset = u16::from_le_bytes([ix.data[2], ix.data[3]]) as usize;
    let signature_ix_index = u16::from_le_bytes([ix.data[4], ix.data[5]]);
    let pubkey_offset = u16::from_le_bytes([ix.data[6], ix.data[7]]) as usize;
    let pubkey_ix_index = u16::from_le_bytes([ix.data[8], ix.data[9]]);
    let message_offset = u16::from_le_bytes([ix.data[10], ix.data[11]]) as usize;
    let message_size = u16::from_le_bytes([ix.data[12], ix.data[13]]) as usize;
    let message_ix_index = u16::from_le_bytes([ix.data[14], ix.data[15]]);

    require!(
        signature_ix_index == u16::MAX
            && pubkey_ix_index == u16::MAX
            && message_ix_index == u16::MAX,
        BlinkRemitError::InvalidRelayerSignature
    );
    require!(
        message_size == expected_message.len(),
        BlinkRemitError::InvalidRelayerSignature
    );

    let signature_end = signature_offset.saturating_add(SIG_LEN);
    let pubkey_end = pubkey_offset.saturating_add(PUBKEY_LEN);
    let message_end = message_offset.saturating_add(message_size);
    require!(
        signature_end <= ix.data.len() && pubkey_end <= ix.data.len() && message_end <= ix.data.len(),
        BlinkRemitError::InvalidRelayerSignature
    );

    let actual_signature = &ix.data[signature_offset..signature_end];
    let actual_pubkey = &ix.data[pubkey_offset..pubkey_end];
    let actual_message = &ix.data[message_offset..message_end];

    require!(
        actual_signature == expected_signature
            && actual_pubkey == expected_pubkey
            && actual_message == expected_message,
        BlinkRemitError::InvalidRelayerSignature
    );

    Ok(())
}
