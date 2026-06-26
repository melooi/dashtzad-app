import crypto from "node:crypto";

// OTP codes are NEVER stored in plaintext. We store an HMAC-SHA256 of the code
// keyed by OTP_SECRET, and compare with a constant-time check.

function getOtpSecret(): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error("OTP_SECRET is not set");
  return secret;
}

/** Generate a 6-digit OTP (leading zeros allowed). */
export function generateOtp(): string {
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, "0");
}

/** HMAC-SHA256(code) keyed by OTP_SECRET → hex digest. */
export function hashOtpCode(code: string): string {
  return crypto.createHmac("sha256", getOtpSecret()).update(code).digest("hex");
}

/** Constant-time comparison of a candidate code against a stored hash. */
export function verifyOtpCode(code: string, codeHash: string): boolean {
  const a = Buffer.from(hashOtpCode(code), "hex");
  const b = Buffer.from(codeHash, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return crypto.timingSafeEqual(a, b);
}
