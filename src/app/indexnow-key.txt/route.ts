import { NextResponse } from "next/server";

// Serves the IndexNow API key for search engine verification.
// IndexNow requires the key to be accessible at a known URL so the engine
// can confirm the submission request is legitimate.
export function GET() {
  const key = process.env.INDEXNOW_API_KEY;
  if (!key) {
    return new NextResponse("not configured", { status: 404 });
  }
  return new NextResponse(key, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
