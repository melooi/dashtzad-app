"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Button } from "@/common/Button";
import { TextField } from "@/common/TextField";
import { Logo } from "@/components/Logo";
import { normalizeDigits, isValidIranianMobile } from "@/lib/auth/phone";
import { toPersianNumbers } from "@/lib/price";

const phoneSchema = z.object({
  phoneNumber: z
    .string()
    .transform((v) => normalizeDigits(v).trim())
    .refine(isValidIranianMobile, "شماره موبایل معتبر نیست (مثل ۰۹۱۲۳۴۵۶۷۸۹)."),
});
const codeSchema = z.object({
  code: z
    .string()
    .transform((v) => normalizeDigits(v).trim())
    .refine((v) => /^\d{6}$/.test(v), "کد باید ۶ رقم باشد."),
});
type PhoneForm = { phoneNumber: string };
type CodeForm = { code: string };

const OTP_TTL = 120;

export function AuthForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/";

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [testCode, setTestCode] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const [serverError, setServerError] = useState("");

  const phoneForm = useForm<PhoneForm>({ resolver: zodResolver(phoneSchema) });
  const codeForm = useForm<CodeForm>({ resolver: zodResolver(codeSchema) });

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => setSeconds((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [seconds]);

  const requestOtp = async (phoneNumber: string) => {
    setServerError("");
    const res = await fetch("/api/auth/get-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber }),
    });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.error ?? "خطا در ارسال کد.");
      return false;
    }
    setPhone(phoneNumber);
    setTestCode(data.code ?? null);
    setSeconds(OTP_TTL);
    setStep("code");
    return true;
  };

  const onPhone = phoneForm.handleSubmit((d) => requestOtp(d.phoneNumber));

  const onCode = codeForm.handleSubmit(async (d) => {
    setServerError("");
    const res = await fetch("/api/auth/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phoneNumber: phone, code: d.code }),
    });
    const data = await res.json();
    if (!res.ok) {
      setServerError(data.error ?? "کد نادرست است.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  });

  return (
    <div className="w-full max-w-sm rounded-2xl border border-dz-primary-100 bg-white p-8 shadow-sm">
      <div className="mb-6 flex flex-col items-center gap-3">
        <Logo variant="full" className="h-10 w-auto" />
        <h1 className="font-heading text-xl font-bold text-dz-primary-800">
          {step === "phone" ? "ورود / ثبت‌نام" : "تأیید کد"}
        </h1>
      </div>

      {step === "phone" ? (
        <form onSubmit={onPhone} className="flex flex-col gap-4">
          <TextField
            label="شماره موبایل"
            inputMode="numeric"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            dir="ltr"
            maxLength={11}
            error={phoneForm.formState.errors.phoneNumber?.message}
            {...phoneForm.register("phoneNumber")}
          />
          {serverError && <span className="text-xs text-dz-error">{serverError}</span>}
          <Button type="submit" disabled={phoneForm.formState.isSubmitting}>
            ارسال کد تأیید
          </Button>
        </form>
      ) : (
        <form onSubmit={onCode} className="flex flex-col gap-4">
          {testCode && (
            <div className="rounded-lg bg-dz-warning/15 px-3 py-2 text-center text-sm text-dz-primary-800">
              کد تست: <b dir="ltr">{toPersianNumbers(testCode)}</b>
            </div>
          )}
          <TextField
            label={`کد ارسال‌شده به ${toPersianNumbers(phone)}`}
            inputMode="numeric"
            placeholder="۱۲۳۴۵۶"
            dir="ltr"
            maxLength={6}
            className="text-center tracking-[0.5em]"
            error={codeForm.formState.errors.code?.message}
            {...codeForm.register("code")}
          />
          {serverError && <span className="text-xs text-dz-error">{serverError}</span>}
          <Button type="submit" disabled={codeForm.formState.isSubmitting}>
            ورود
          </Button>

          <div className="flex items-center justify-between text-xs text-dz-primary-600">
            <button type="button" onClick={() => setStep("phone")} className="flex items-center gap-1 hover:text-dz-primary-800">
              <ArrowRight className="size-3.5" />
              تغییر شماره
            </button>
            {seconds > 0 ? (
              <span>ارسال مجدد تا {toPersianNumbers(seconds)} ثانیه</span>
            ) : (
              <button type="button" onClick={() => requestOtp(phone)} className="font-bold text-dz-primary-600 hover:underline">
                ارسال مجدد کد
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
