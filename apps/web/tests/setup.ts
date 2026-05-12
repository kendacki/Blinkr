/**
 * Vitest loads this before tests. Keeps boot env validation skipped while
 * still providing values for code paths that read process.env.
 */
process.env.SKIP_ENV_VALIDATION = "1";

process.env.SOLANA_RPC_URL = "http://localhost:8899";
process.env.PROGRAM_ID = "246VxdVvQkKDk51fxbAYaszJHsqoRQd8vdqbBy7LKjgx";
// Must match `EXPECTED_RELAYER` in programs/blinkremit/src/constants.rs (dev sample).
process.env.RELAYER_KEYPAIR =
  "[170,5,83,62,148,154,172,24,35,216,119,121,164,21,9,10,47,25,209,71,32,187,24,165,255,135,216,146,135,132,23,47,150,14,176,34,57,1,102,57,217,38,243,66,223,111,118,119,169,126,182,20,177,124,135,102,230,100,33,174,205,254,37,204]";
process.env.RELAYER_PUBKEY = "B6m9QCBw4q6wrvrE4JXKPtFdihFFgFwpAdp4nZcRa3x7";
process.env.CRON_SECRET = "test-cron-secret-at-least-16-chars";
process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/test";
process.env.REDIS_URL = "redis://localhost:6379";
process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
process.env.JWT_SECRET = "test-jwt-secret-at-least-32-characters-long";
process.env.SESSION_SECRET = "test-session-secret-at-least-32-chars";
process.env.MESO_API_KEY = "x";
process.env.MESO_WEBHOOK_SECRET = "x";
process.env.MOONPAY_API_KEY = "x";
process.env.MOONPAY_SECRET_KEY = "x";
process.env.RESEND_API_KEY = "x";
process.env.FROM_EMAIL = "noreply@example.com";
process.env.SENTRY_DSN = "https://example.com/123";
process.env.HELIUS_WEBHOOK_AUTH_HEADER = "x";
process.env.HELIUS_API_KEY = "x";
process.env.USDC_MINT_ADDRESS = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";
process.env.SQUADS_PROGRAM_ID = "11111111111111111111111111111111";
process.env.CORS_ALLOWED_ORIGINS = "http://localhost:3000";
process.env.CONTRACTOR_WALLET_DERIVATION_SECRET =
  "test-contractor-derivation-secret-32chars";
