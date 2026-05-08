import { Resend } from "resend";

export type SendEmailResult =
  | { sent: true; id: string | null }
  | { sent: false; skipped: true; reason: string }
  | { sent: false; skipped: false; reason: string };

/**
 * Sends a transactional email via Resend.
 *
 * Returns a structured result so callers can decide whether a missing API key
 * is a soft skip (e.g. cron in dev) or a hard failure (e.g. user-initiated send).
 * Resend's SDK does NOT throw on API errors; it returns `{ data, error }`, so
 * we must inspect `error` ourselves.
 */
export async function sendTransactionalEmail(input: {
  to: string;
  subject: string;
  text: string;
}): Promise<SendEmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set; skipping send");
    return { sent: false, skipped: true, reason: "RESEND_API_KEY not set" };
  }
  const from = process.env.FROM_EMAIL;
  if (!from) {
    return { sent: false, skipped: true, reason: "FROM_EMAIL not set" };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to: input.to,
    subject: input.subject,
    text: input.text,
  });

  if (error) {
    console.error("[email] Resend error", error);
    return {
      sent: false,
      skipped: false,
      reason: error.message ?? "Resend rejected the request",
    };
  }
  return { sent: true, id: data?.id ?? null };
}
