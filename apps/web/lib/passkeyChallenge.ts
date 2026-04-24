export function passkeyChallengeKey(blinkId: string): string {
  return `passkey:challenge:${blinkId}`;
}

export type PasskeyChallengePayload = {
  challenge: string;
  flow: "register" | "authenticate";
  email: string;
  webauthnUserId: string;
};
