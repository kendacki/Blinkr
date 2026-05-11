import { z } from "zod";

/** String-encoded decimal for USDC (no floats in JSON). */
export const decimalUsdcString = z
  .string()
  .regex(
    /^\d+(\.\d{1,6})?$/,
    "amountUsdc must be a decimal string with up to 6 fractional digits"
  );

export const createBlinkBodySchema = z.object({
  contractorEmail: z.string().email(),
  amountUsdc: decimalUsdcString,
  employerWallet: z.string().min(32).max(64),
  serializedTx: z.string().min(1).optional(),
});

export const contractorSendCodeBodySchema = z.object({
  email: z.string().email(),
});

export const contractorVerifyCodeBodySchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, "code must be a 6-digit string"),
});

export const employerAuthBodySchema = z.object({
  walletAddress: z.string().min(32).max(64),
  message: z.string().min(1),
  signatureBase58: z.string().min(32).max(128),
});

export const offrampInitiateBodySchema = z.object({
  blinkId: z.string().min(1),
  walletAddress: z.string().min(32).max(64),
  bankDetails: z.record(z.string(), z.unknown()),
  provider: z.enum(["meso", "moonpay"]),
});
