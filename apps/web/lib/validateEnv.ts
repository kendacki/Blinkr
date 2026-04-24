/**
 * Boot-time validation for required environment variables.
 * See `.env.example` and project.md for descriptions.
 * Set `SKIP_ENV_VALIDATION=1` only for tests or one-off tooling.
 */
const REQUIRED = [
  "SOLANA_RPC_URL",
  "PROGRAM_ID",
  "RELAYER_KEYPAIR",
  "RELAYER_PUBKEY",
  "DATABASE_URL",
  "REDIS_URL",
  "RP_ID",
  "NEXT_PUBLIC_URL",
  "JWT_SECRET",
  "SESSION_SECRET",
  "MESO_API_KEY",
  "MESO_WEBHOOK_SECRET",
  "MOONPAY_API_KEY",
  "MOONPAY_SECRET_KEY",
  "RESEND_API_KEY",
  "FROM_EMAIL",
  "SENTRY_DSN",
  "HELIUS_WEBHOOK_AUTH_HEADER",
  "HELIUS_API_KEY",
  "USDC_MINT_ADDRESS",
  "SQUADS_PROGRAM_ID",
  "CORS_ALLOWED_ORIGINS",
  "NODE_ENV",
] as const;

export function validateEnv(): void {
  const missing = REQUIRED.filter((k) => !process.env[k]);
  if (missing.length > 0) {
    console.error("[Blinkr] FATAL: Missing required environment variables:");
    missing.forEach((k) => console.error(`  - ${k}`));
    process.exit(1);
  }
}
