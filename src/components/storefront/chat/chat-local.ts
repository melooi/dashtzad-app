"use client";

// CHAT-CP1 — reattach a returning visitor (guest or logged-in) to their own
// thread via an unguessable publicToken kept in localStorage. Guarded so SSR /
// private-mode never throws.

const TOKEN_KEY = "dz_chat_token";
const GUEST_KEY = "dz_chat_guest";

export function getStoredToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearStoredToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export type GuestIdentity = { name: string; phone: string };

export function getStoredGuest(): GuestIdentity {
  try {
    const raw = window.localStorage.getItem(GUEST_KEY);
    if (raw) return JSON.parse(raw) as GuestIdentity;
  } catch {
    /* ignore */
  }
  return { name: "", phone: "" };
}

export function setStoredGuest(guest: GuestIdentity): void {
  try {
    window.localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
  } catch {
    /* ignore */
  }
}
