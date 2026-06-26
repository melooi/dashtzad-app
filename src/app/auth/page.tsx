import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/views/auth/AuthForm";

export const metadata: Metadata = {
  title: "ورود | دشت‌زاد",
  description: "ورود و ثبت‌نام در دشت‌زاد با کد یک‌بار مصرف.",
  robots: { index: false },
};

export default function AuthPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-dz-primary-50 px-4 py-16">
      <Suspense>
        <AuthForm />
      </Suspense>
      <Link href="/" className="text-sm text-dz-primary-600 hover:underline">
        بازگشت به خانه
      </Link>
    </main>
  );
}
