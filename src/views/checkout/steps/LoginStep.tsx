"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, User, Send, RotateCcw, ArrowRight, Eye, EyeOff } from "lucide-react";
import { normalizeDigits, isValidIranianMobile } from "@/lib/auth/phone";
import { toPersianNumbers } from "@/lib/price";

type Tab = "otp" | "password";

const OTP_TTL = 120;

export function LoginStep() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("otp");

  /* ── OTP flow ────────────────────────────────────────────────── */
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [otpStage, setOtpStage] = useState<"phone" | "code">("phone");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [testCode, setTestCode] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);

  /* ── password flow ───────────────────────────────────────────── */
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [pwError, setPwError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const sendOtp = async (phoneNumber: string) => {
    const normalized = normalizeDigits(phoneNumber).trim();
    if (!isValidIranianMobile(normalized)) {
      setPhoneError("شماره موبایل معتبر نیست.");
      return;
    }
    setPhoneError("");
    setSendingOtp(true);
    const res = await fetch("/api/auth/get-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: normalized }),
    });
    const data = await res.json();
    setSendingOtp(false);
    if (!res.ok) { setPhoneError(data.error ?? "خطا در ارسال کد."); return; }
    setTestCode(data.code ?? null);
    setSeconds(OTP_TTL);
    setOtpStage("code");
  };

  const verifyOtp = async () => {
    const normalized = normalizeDigits(code).trim();
    if (!/^\d{6}$/.test(normalized)) { setCodeError("کد باید ۶ رقم باشد."); return; }
    setCodeError("");
    setVerifying(true);
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: normalizeDigits(phone).trim(), code: normalized }),
    });
    const data = await res.json();
    setVerifying(false);
    if (!res.ok) { setCodeError(data.error ?? "کد نادرست است."); return; }
    router.refresh();
  };

  const loginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setLoggingIn(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    setLoggingIn(false);
    if (!res.ok) { setPwError(data.error ?? "اطلاعات نادرست است."); return; }
    router.refresh();
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-heading text-xl font-bold text-store-text">ورود به دشت‌زاد</h2>
        <p className="mt-0.5 text-sm text-store-text-faint">
          {otpStage === "phone"
            ? "شماره موبایل خود را وارد کنید تا کد تایید برایتان ارسال شود."
            : `کد ارسال‌شده به ${toPersianNumbers(normalizeDigits(phone))} را وارد کنید.`}
        </p>
      </div>

      {/* tab switcher */}
      <div className="flex rounded-xl border border-store-border bg-store-surface-soft p-1">
        {(["otp", "password"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => { setTab(t); setPhoneError(""); setCodeError(""); setPwError(""); }}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium transition-all ${
              tab === t
                ? "bg-store-surface text-store-text shadow-store-xs"
                : "text-store-text-muted hover:text-store-text"
            }`}
          >
            {t === "otp" ? <Smartphone className="size-4" /> : <User className="size-4" />}
            {t === "otp" ? "پیامکی" : "نام کاربری"}
          </button>
        ))}
      </div>

      {/* ── OTP tab ──────────────────────────────────────────────── */}
      {tab === "otp" && (
        <div className="flex flex-col gap-4">
          {otpStage === "phone" ? (
            <>
              {/* phone input */}
              <label className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-store-text">شماره موبایل</span>
                <div className={`flex items-center rounded-xl border bg-store-surface transition-colors focus-within:border-store-primary ${phoneError ? "border-store-clay" : "border-store-border"}`}>
                  <Smartphone className="mr-3.5 size-4 shrink-0 text-store-text-faint" />
                  <input
                    type="tel"
                    dir="ltr"
                    inputMode="numeric"
                    placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendOtp(phone)}
                    maxLength={11}
                    className="w-full bg-transparent py-3 pl-3.5 text-store-text outline-none placeholder:text-store-text-faint"
                  />
                </div>
                {phoneError && <span className="text-xs text-store-clay">{phoneError}</span>}
              </label>

              <button
                type="button"
                onClick={() => sendOtp(phone)}
                disabled={sendingOtp}
                className="store-btn store-btn-primary w-full justify-center gap-2 py-3.5 text-base"
              >
                <Send className="size-4" />
                {sendingOtp ? "در حال ارسال…" : "ارسال کد تایید"}
              </button>
            </>
          ) : (
            <>
              {/* phone badge + edit */}
              <div className="flex items-center gap-2 rounded-xl border border-store-border bg-store-surface-soft px-4 py-3">
                <Smartphone className="size-4 text-store-primary-hover" />
                <span dir="ltr" className="flex-1 text-sm font-medium text-store-text">
                  {toPersianNumbers(normalizeDigits(phone))}
                </span>
                <button
                  type="button"
                  onClick={() => { setOtpStage("phone"); setCode(""); setCodeError(""); }}
                  className="flex items-center gap-1 text-xs font-bold text-store-primary-hover"
                >
                  <ArrowRight className="size-3.5" /> ویرایش
                </button>
              </div>

              {testCode && (
                <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-2.5 text-center text-sm text-amber-800">
                  کد تست: <b dir="ltr" className="tracking-widest">{toPersianNumbers(testCode)}</b>
                </div>
              )}

              {/* 6-digit OTP inputs */}
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-store-text">کد تایید را وارد کنید</span>
                <input
                  type="tel"
                  dir="ltr"
                  inputMode="numeric"
                  placeholder="● ● ● ● ● ●"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && verifyOtp()}
                  maxLength={6}
                  className={`rounded-xl border bg-store-surface px-4 py-3.5 text-center font-bold text-xl tracking-[0.6em] text-store-text outline-none transition-colors focus:border-store-primary ${
                    codeError ? "border-store-clay" : "border-store-border"
                  }`}
                />
                {codeError && <span className="text-xs text-store-clay text-center">{codeError}</span>}
              </div>

              <div className="flex items-center justify-between text-xs text-store-text-faint">
                <button
                  type="button"
                  onClick={() => sendOtp(phone)}
                  disabled={seconds > 0}
                  className="flex items-center gap-1 font-bold text-store-primary-hover disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <RotateCcw className="size-3.5" /> ارسال مجدد
                </button>
                {seconds > 0 && (
                  <span>
                    اعتبار کد: <span className="text-store-clay font-bold">{toPersianNumbers(seconds)} ثانیه</span>
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={verifyOtp}
                disabled={verifying || code.length < 6}
                className="store-btn store-btn-primary w-full justify-center gap-2 py-3.5 text-base disabled:opacity-60"
              >
                {verifying ? "در حال بررسی…" : "ورود و ادامه خرید"}
              </button>
            </>
          )}
        </div>
      )}

      {/* ── password tab ─────────────────────────────────────────── */}
      {tab === "password" && (
        <form onSubmit={loginWithPassword} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-store-text">نام کاربری یا ایمیل</span>
            <div className="flex items-center rounded-xl border border-store-border bg-store-surface transition-colors focus-within:border-store-primary">
              <User className="mr-3.5 size-4 shrink-0 text-store-text-faint" />
              <input
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="نام کاربری یا ایمیل"
                className="w-full bg-transparent py-3 pl-3.5 text-store-text outline-none placeholder:text-store-text-faint"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-store-text">رمز عبور</span>
            <div className="flex items-center rounded-xl border border-store-border bg-store-surface transition-colors focus-within:border-store-primary">
              <button type="button" onClick={() => setShowPw(!showPw)} className="mr-3.5 shrink-0 text-store-text-faint">
                {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="رمز عبور"
                className="w-full bg-transparent py-3 pl-3.5 text-store-text outline-none placeholder:text-store-text-faint"
              />
            </div>
          </label>

          {pwError && <p className="text-xs text-store-clay">{pwError}</p>}

          <button
            type="submit"
            disabled={loggingIn}
            className="store-btn store-btn-primary w-full justify-center py-3.5 text-base"
          >
            {loggingIn ? "در حال ورود…" : "ورود و ادامه خرید"}
          </button>
        </form>
      )}

      <p className="text-center text-xs text-store-text-faint">
        با ورود، <a href="/rules" className="font-bold text-store-primary-hover">قوانین و مقررات</a> دشت‌زاد را پذیرفته‌اید.
      </p>
    </div>
  );
}
