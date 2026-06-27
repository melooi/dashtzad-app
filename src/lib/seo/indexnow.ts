const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

/** Fire-and-forget: submit a single URL when content is published/updated. */
export function notifyIndexNow(path: string): void {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!process.env.INDEXNOW_API_KEY || !baseUrl) return;
  submitToIndexNow([`${baseUrl}${path}`]).catch(() => {/* silent */});
}

export async function submitToIndexNow(urls: string[]): Promise<{ ok: boolean; error?: string }> {
  const key = process.env.INDEXNOW_API_KEY;
  const host = process.env.NEXT_PUBLIC_SITE_URL
    ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
    : null;

  if (!key || !host) {
    return { ok: false, error: "INDEXNOW_API_KEY یا NEXT_PUBLIC_SITE_URL تنظیم نشده" };
  }

  try {
    const keyLocation = `${process.env.NEXT_PUBLIC_SITE_URL}/indexnow-key.txt`;

    const res = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ host, key, keyLocation, urlList: urls }),
    });

    if (res.ok || res.status === 202) return { ok: true };
    const text = await res.text().catch(() => "");
    return { ok: false, error: `IndexNow: ${res.status} ${text}` };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "خطای ناشناخته" };
  }
}
