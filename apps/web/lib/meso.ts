/**
 * Meso Finance client (stub). Replace with real HTTP calls to Meso APIs.
 */
export type MesoOfframpQuote = {
  estimatedFiat: string;
  currency: string;
  etaMinutes: number;
};

export async function quoteMesoOfframp(_input: {
  amountUsdc: string;
  currency: string;
}): Promise<MesoOfframpQuote> {
  return {
    estimatedFiat: "0.00",
    currency: _input.currency || "USD",
    etaMinutes: 60,
  };
}

export async function submitMesoOfframp(_input: {
  blinkId: string;
  providerRef: string;
}): Promise<{ providerRef: string }> {
  void _input;
  return { providerRef: "meso-stub" };
}
