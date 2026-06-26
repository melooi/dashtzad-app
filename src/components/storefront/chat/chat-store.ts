"use client";

// CHAT-CP1 — tiny module-level open/close store shared across sibling client
// components (the bottom-nav center action and the floating widget) without a
// React provider, using useSyncExternalStore (same approach as useCartCount).

import { useSyncExternalStore } from "react";

let open = false;
let unread = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function openChat() {
  if (!open) {
    open = true;
    emit();
  }
}

export function closeChat() {
  if (open) {
    open = false;
    emit();
  }
}

export function toggleChat() {
  open = !open;
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

export function useChatOpen(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => open,
    () => false,
  );
}

/** Published by the widget so the bottom-nav center badge can mirror it. */
export function setChatUnread(n: number) {
  if (n !== unread) {
    unread = n;
    emit();
  }
}

export function useChatUnread(): number {
  return useSyncExternalStore(
    subscribe,
    () => unread,
    () => 0,
  );
}
