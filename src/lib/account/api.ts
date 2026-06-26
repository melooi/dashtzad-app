// Shared JSON responses for account API routes — Persian, no stack traces.
import { NextResponse } from "next/server";

export const unauthorized = () =>
  NextResponse.json({ error: "برای ادامه ابتدا وارد شوید." }, { status: 401 });

export const badRequest = (error: string) => NextResponse.json({ error }, { status: 400 });

export const notFoundJson = (error = "موردی یافت نشد.") =>
  NextResponse.json({ error }, { status: 404 });

export const serverError = (error = "خطایی رخ داد. دوباره تلاش کنید.") =>
  NextResponse.json({ error }, { status: 500 });
