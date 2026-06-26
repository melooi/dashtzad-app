export type AdminAccent =
  | "indigo" | "blue" | "violet" | "teal"
  | "emerald" | "amber" | "rose" | "slate";

export const ACCENT_STORAGE_KEY = "dz-admin-accent";

export const ADMIN_ACCENTS: {
  id: AdminAccent;
  label: string;
  swatch: string;  // primary-600
  mid: string;     // primary-400 — lighter preview dot
  canvas: string;
}[] = [
  { id: "indigo",  label: "ایندیگو",  swatch: "#4f46e5", mid: "#818cf8", canvas: "#fafaff" },
  { id: "blue",    label: "آبی",      swatch: "#2563eb", mid: "#60a5fa", canvas: "#f8fbff" },
  { id: "violet",  label: "بنفش",     swatch: "#7c3aed", mid: "#a78bfa", canvas: "#faf8ff" },
  { id: "teal",    label: "فیروزه",   swatch: "#0d9488", mid: "#2dd4bf", canvas: "#f7fffe" },
  { id: "emerald", label: "زمردی",    swatch: "#059669", mid: "#34d399", canvas: "#f7fdf9" },
  { id: "amber",   label: "کهربا",    swatch: "#d97706", mid: "#fbbf24", canvas: "#fffdf5" },
  { id: "rose",    label: "رز",       swatch: "#e11d48", mid: "#fb7185", canvas: "#fff8f8" },
  { id: "slate",   label: "خاکستری",  swatch: "#475569", mid: "#94a3b8", canvas: "#f8fafc" },
];

export const DEFAULT_ACCENT: AdminAccent = "indigo";

const VALID_ACCENTS: AdminAccent[] = [
  "indigo", "blue", "violet", "teal", "emerald", "amber", "rose", "slate",
];

export function isAdminAccent(v: unknown): v is AdminAccent {
  return VALID_ACCENTS.includes(v as AdminAccent);
}

export function applyAccent(accent: AdminAccent): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.adminAccent = accent;
}

export function saveAccent(accent: AdminAccent): void {
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  } catch {}
  applyAccent(accent);
}

export function loadAccent(): AdminAccent {
  try {
    const v = localStorage.getItem(ACCENT_STORAGE_KEY);
    if (isAdminAccent(v)) return v;
  } catch {}
  return DEFAULT_ACCENT;
}

export const ACCENT_INIT_SCRIPT = `(function(){try{var k=${JSON.stringify(
  ACCENT_STORAGE_KEY,
)};var v=localStorage.getItem(k);var valid=${JSON.stringify(
  VALID_ACCENTS,
)};document.documentElement.dataset.adminAccent=valid.includes(v)?v:${JSON.stringify(
  DEFAULT_ACCENT,
)};}catch(e){}})();`;
