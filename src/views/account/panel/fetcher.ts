// Tiny fetch helpers for the account panel's client sections. They surface the
// server's Persian error message (never a stack trace).

export async function jsonGet<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "خطا در دریافت اطلاعات.");
  }
  return res.json() as Promise<T>;
}

export async function jsonSend<T>(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.error || "خطا. دوباره تلاش کنید.");
  return data as T;
}
