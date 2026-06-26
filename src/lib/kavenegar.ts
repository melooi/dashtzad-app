// Kavenegar OTP sender. In OTP_TESTING_MODE we never call this.
// If the API key is missing, we fail soft (do not throw) so dev/testing works.

export async function sendOtpSms(
  phoneNumber: string,
  code: string,
): Promise<{ sent: boolean; reason?: string }> {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  const template = process.env.KAVENEGAR_OTP_TEMPLATE || "dashtzad-otp";

  if (!apiKey) return { sent: false, reason: "KAVENEGAR_API_KEY not set" };

  const url =
    `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json` +
    `?receptor=${encodeURIComponent(phoneNumber)}` +
    `&token=${encodeURIComponent(code)}` +
    `&template=${encodeURIComponent(template)}`;

  try {
    const res = await fetch(url, { method: "GET" });
    return { sent: res.ok, reason: res.ok ? undefined : `HTTP ${res.status}` };
  } catch (err) {
    return { sent: false, reason: (err as Error).message };
  }
}
