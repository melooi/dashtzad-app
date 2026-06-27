"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { getEffectiveValue } from "@/lib/admin/integration-config";

const BASE = "https://api.hamkaran.cloud";

async function getKey(): Promise<string | undefined> {
  return getEffectiveValue("santral", "apiKey");
}

// ── Types ──────────────────────────────────────────────────────────────

export type HkCallRow = {
  uniqueid: string;
  id: string;
  eventtime: string;
  time: string;
  timestamp: number;
  type: "incoming" | "outgoing" | string;
  type_name?: string;
  status: "ANSWER" | "Failed" | string;
  cid_num: string;
  exten: string;
  channame: string;
  duration: string;
  file: string | false;
  moreinfo: Record<string, unknown>[];
};

export type HkReportsResponse = {
  ok: boolean;
  error?: string;
  data?: {
    total: number;
    pages: number;
    page: string;
    rows: HkCallRow[];
  };
};

export type HkExtension = {
  internalnumber: string;
  number: number;
  server_url: string;
  status: "OK" | "UNKNOWN" | string;
  status_text: string;
  client_ip: string;
  client_port: string;
};

export type HkExtensionResponse = {
  ok: boolean;
  error?: string;
  id?: number;
  dec?: string;
  server_url?: string;
  extensions?: HkExtension[];
};

export type HkDashboardSummary = {
  total_calls: number;
  incoming_calls: number;
  outgoing_calls: number;
  missed_calls: number;
  answered_calls: number;
  voicemails: number;
  queues: number;
  ivr_entries: number;
  agents_online: number;
  agents_busy: number;
  agents_offline: number;
};

export type HkDashboardResponse = {
  ok: boolean;
  error?: string;
  summary?: HkDashboardSummary;
  call_statistics?: {
    hourly_chart: { hour: number; count: number }[];
    daily_chart: { date: string; count: number }[];
  };
  system_health?: {
    cpu_usage: number;
    memory_usage: number;
    disk_space: { used: number; total: number };
    active_channels: number;
  };
};

export type HkVoicemail = {
  key: string;
  date: string;
  time: string;
  voicEmailBox: string;
  callerIdname: string;
  callerId: number;
  recordFile: string;
  isread: string;
  notid: number | null;
};

export type HkVoicemailResponse = {
  ok: boolean;
  error?: string;
  items?: HkVoicemail[];
};

export type HkOtpResult = { ok: boolean; message: string };

// ── Reports (call log) ────────────────────────────────────────────────

export async function fetchCallsAction(
  dateFrom: string,
  dateTo: string,
  page = 1,
  internalnumber = "",
): Promise<HkReportsResponse> {
  await requireAdmin();
  const apiKey = await getKey();
  if (!apiKey) return { ok: false, error: "کلید API سانترال تنظیم نشده است." };

  try {
    const params = new URLSearchParams({
      datefrom: dateFrom,
      dateto: dateTo,
      page: String(page),
      source: "",
      internalnumber,
    });
    const res = await fetch(`${BASE}/api/hamkaran/v1/reports?${params}`, {
      headers: { key: apiKey },
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      const isAccess = body.includes("Access denied") || res.status === 401 || res.status === 403;
      return { ok: false, error: isAccess ? "کلید API نامعتبر است (Access denied)." : `خطا از سرور: ${res.status}` };
    }
    const json = (await res.json()) as { data?: HkReportsResponse["data"] };
    return { ok: true, data: json.data };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "خطای ناشناخته";
    return { ok: false, error: `اتصال ناموفق: ${msg}` };
  }
}

// ── Extension Status ───────────────────────────────────────────────────

export async function fetchExtensionsAction(): Promise<HkExtensionResponse> {
  await requireAdmin();
  const apiKey = await getKey();
  if (!apiKey) return { ok: false, error: "کلید API سانترال تنظیم نشده است." };

  try {
    const res = await fetch(`${BASE}/api/hamkaran/v1/extension`, {
      headers: { key: apiKey },
      signal: AbortSignal.timeout(8000),
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: body.includes("Access denied") ? "کلید API نامعتبر است." : `خطا: ${res.status}` };
    }
    const json = (await res.json()) as {
      id?: number;
      dec?: string;
      server_url?: string;
      extension?: Record<string, HkExtension>;
    };
    const extensions = Object.values(json.extension ?? {});
    return { ok: true, id: json.id, dec: json.dec, server_url: json.server_url, extensions };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "خطای اتصال" };
  }
}

// ── Dashboard ──────────────────────────────────────────────────────────

export async function fetchDashboardAction(days = 7): Promise<HkDashboardResponse> {
  await requireAdmin();
  const apiKey = await getKey();
  if (!apiKey) return { ok: false, error: "کلید API سانترال تنظیم نشده است." };

  try {
    const res = await fetch(`${BASE}/api/hamkaran/v1/dashboard?date=${days}`, {
      headers: { key: apiKey },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: body.includes("Access denied") ? "کلید API نامعتبر است." : `خطا: ${res.status}` };
    }
    const json = (await res.json()) as Omit<HkDashboardResponse, "ok">;
    return { ok: true, ...json };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "خطای اتصال" };
  }
}

// ── Voicemail ──────────────────────────────────────────────────────────

export async function fetchVoicemailsAction(days = 30): Promise<HkVoicemailResponse> {
  await requireAdmin();
  const apiKey = await getKey();
  if (!apiKey) return { ok: false, error: "کلید API سانترال تنظیم نشده است." };

  try {
    const res = await fetch(`${BASE}/api/hamkaran/v1/voicemail?date=${days}`, {
      headers: { key: apiKey },
      signal: AbortSignal.timeout(10000),
      next: { revalidate: 0 },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      return { ok: false, error: body.includes("Access denied") ? "کلید API نامعتبر است." : `خطا: ${res.status}` };
    }
    const json = (await res.json()) as { data?: Record<string, Omit<HkVoicemail, "key">> };
    const items: HkVoicemail[] = Object.entries(json.data ?? {}).map(([key, v]) => ({ key, ...v }));
    return { ok: true, items };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "خطای اتصال" };
  }
}

// ── HangUp Call ────────────────────────────────────────────────────────

export async function hangUpCallAction(channelId: string): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const apiKey = await getKey();
  if (!apiKey) return { ok: false, message: "کلید API سانترال تنظیم نشده است." };

  try {
    const form = new FormData();
    form.append("channel_id", channelId);
    const res = await fetch(`${BASE}/api/hamkaran/v1/hang_up_call`, {
      method: "POST",
      headers: { key: apiKey },
      body: form,
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return { ok: true, message: "تماس قطع شد." };
    const body = await res.text().catch(() => "");
    return { ok: false, message: body || `خطا: ${res.status}` };
  } catch {
    return { ok: false, message: "اتصال ناموفق" };
  }
}

// ── Send OTP via voice call ───────────────────────────────────────────

export async function sendOtpAction(dest: string, otp: string): Promise<HkOtpResult> {
  await requireAdmin();
  const apiKey = await getKey();
  if (!apiKey) return { ok: false, message: "کلید API سانترال تنظیم نشده است." };

  const src = (await getEffectiveValue("santral", "pbxNumber")) ?? "";
  if (!src) return { ok: false, message: "شماره سانترال (pbxNumber) تنظیم نشده است." };

  const mobile = dest.startsWith("0") ? dest.slice(1) : dest;

  try {
    const form = new FormData();
    form.append("dest", mobile);
    form.append("src", src);
    form.append("otp", otp);

    const res = await fetch(`${BASE}/api/hamkaran/v1/send-otp`, {
      method: "POST",
      headers: { key: apiKey },
      body: form,
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) return { ok: true, message: `کد OTP ${otp} با تماس صوتی به ${dest} ارسال شد.` };
    const body = await res.text().catch(() => "");
    return { ok: false, message: body || `خطا از سانترال: ${res.status}` };
  } catch {
    return { ok: false, message: "ارسال OTP صوتی ناموفق بود." };
  }
}

// ── Call Originate (Click-to-Call) ────────────────────────────────────
// Endpoint: POST /api/hamkaran/v1/create_call
// Body: src (extension), dst (destination), opt_name, pstn_id

export async function callOriginateAction(
  destination: string,
): Promise<{ ok: boolean; message: string }> {
  await requireAdmin();
  const [apiKey, extension] = await Promise.all([
    getKey(),
    getEffectiveValue("santral", "extension"),
  ]);
  if (!apiKey) return { ok: false, message: "کلید API سانترال تنظیم نشده است." };
  const src = extension || "101";

  try {
    const form = new FormData();
    form.append("src", src);
    form.append("dst", destination);

    const res = await fetch(`${BASE}/api/hamkaran/v1/create_call`, {
      method: "POST",
      headers: { key: apiKey },
      body: form,
      signal: AbortSignal.timeout(8000),
    });
    if (res.ok) return { ok: true, message: "تماس در حال برقراری است." };
    const body = await res.text().catch(() => "");
    return { ok: false, message: body || `خطا از سانترال: ${res.status}` };
  } catch {
    return { ok: false, message: "اتصال به سانترال ناموفق بود." };
  }
}

// ── Balance ───────────────────────────────────────────────────────────

export async function fetchBalanceAction(): Promise<{ ok: boolean; balance?: string; error?: string }> {
  await requireAdmin();
  const apiKey = await getKey();
  if (!apiKey) return { ok: false, error: "کلید API تنظیم نشده است." };
  try {
    const res = await fetch(`${BASE}/api/hamkaran/v1/balance/get`, {
      method: "POST",
      headers: { key: apiKey, "Content-Type": "application/json" },
      body: "{}",
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return { ok: false, error: `خطا: ${res.status}` };
    const json = (await res.json()) as { data?: { balance?: string | number } };
    return { ok: true, balance: String(json.data?.balance ?? "—") };
  } catch {
    return { ok: false, error: "اتصال ناموفق" };
  }
}
