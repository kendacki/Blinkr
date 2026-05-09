# Blinkr build context

Short reference for agents and humans. Keep this accurate when the stack changes.

## Product

Blinkr: employer-funded USDC escrows on Solana (devnet in repo defaults), with a Next.js dashboard and marketing site.

## Stack

- **On-chain:** Anchor 1.0, program `blinkremit` in `programs/blinkremit/`.
- **Web:** Next.js 14, Prisma 5, Tailwind 4, Vitest, BullMQ, Redis, Resend, SimpleWebAuthn, Next.js Metadata (Robots/Sitemap).
- **Integrations:** Helius webhooks, Meso/Moonpay placeholders, Sentry optional, Resend for support tickets.

## Critical config

- Program ID: `Anchor.toml` `[programs.devnet]` and `apps/web/.env.example` `PROGRAM_ID`.
- Relayer: `EXPECTED_RELAYER` in `programs/blinkremit/src/constants.rs` must match `RELAYER_PUBKEY` and the keypair used to sign claim transactions server-side.
- USDC mint: devnet Circle test USDC in constants; env `USDC_MINT_ADDRESS` must match.

## Monorepo commands

See `AGENTS.md` and root `package.json` scripts (`yarn test`, `yarn dev`, `yarn anchor:build`, `yarn docs:dev`).

## Documentation

Mintlify site source: `apps/docs/` (`docs.json`, MDX). Deploy via Mintlify dashboard with monorepo path `apps/docs`.
