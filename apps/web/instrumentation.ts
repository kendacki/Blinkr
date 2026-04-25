export async function register() {
  if (process.env.SKIP_ENV_VALIDATION === "1") {
    return;
  }
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("./lib/validateEnv");
    validateEnv();
    if (process.env.SENTRY_DSN) {
      const Sentry = await import("@sentry/node");
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        tracesSampleRate: 0.05,
        environment: process.env.NODE_ENV,
      });
    }
  }
}
