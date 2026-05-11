export function contractorOtpPayloadKey(blinkId: string): string {
  return `contractor:otp:${blinkId}`;
}

export function contractorOtpSendCooldownKey(blinkId: string): string {
  return `contractor:otp:send:${blinkId}`;
}

export function contractorOtpVerifyFailsKey(blinkId: string): string {
  return `contractor:otp:fails:${blinkId}`;
}

export type ContractorOtpPayload = {
  code: string;
  emailNorm: string;
};
