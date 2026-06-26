// Client-side cart stored in localStorage (DB cart comes in a later phase).
// Emits a "dz-cart-changed" event so the Header badge can react.

export type CartItem = {
  productId: string;
  slug: string;
  title: string;
  image: string | null;
  priceRial: number; // effective unit price (offPrice if present, else price)
  basePriceRial: number; // original price (for showing savings)
  quantity: number;
  /** Chosen variant id — present for variable products. Simple products omit it. */
  variantId?: string;
  /** Human variant summary, e.g. "۵۰۰ گرم · جعبه هدیه". Shown in the cart line. */
  variantLabel?: string;
};

/**
 * Identity of a cart line. Variants of the same product are distinct lines, so
 * we key by variantId when present, else by productId (simple products). Old
 * callers that pass a bare productId still match simple lines correctly.
 */
export function lineKey(item: Pick<CartItem, "productId" | "variantId">): string {
  return item.variantId ?? item.productId;
}

const KEY = "dz_cart";
const EVENT = "dz-cart-changed";

function read(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: CartItem[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export const CART_EVENT = EVENT;

export function getCart(): CartItem[] {
  return read();
}

export function getCount(): number {
  return read().reduce((sum, i) => sum + i.quantity, 0);
}

/** Quantity currently in the cart for a given line key (0 if absent). */
export function getQty(key: string): number {
  return read().find((i) => lineKey(i) === key)?.quantity ?? 0;
}

export function addItem(item: Omit<CartItem, "quantity">, quantity = 1): void {
  const items = read();
  const k = lineKey(item);
  const existing = items.find((i) => lineKey(i) === k);
  if (existing) existing.quantity += quantity;
  else items.push({ ...item, quantity });
  write(items);
}

export function increment(key: string): void {
  const items = read();
  const it = items.find((i) => lineKey(i) === key);
  if (it) it.quantity += 1;
  write(items);
}

export function decrement(key: string): void {
  let items = read();
  const it = items.find((i) => lineKey(i) === key);
  if (it) {
    it.quantity -= 1;
    if (it.quantity <= 0) items = items.filter((i) => lineKey(i) !== key);
  }
  write(items);
}

/** Set an exact quantity for a line; quantity <= 0 removes the line. */
export function setQty(key: string, quantity: number): void {
  let items = read();
  const it = items.find((i) => lineKey(i) === key);
  if (it) {
    if (quantity <= 0) items = items.filter((i) => lineKey(i) !== key);
    else it.quantity = quantity;
  }
  write(items);
}

export function removeItem(key: string): void {
  write(read().filter((i) => lineKey(i) !== key));
}

export function clear(): void {
  write([]);
}

export function getTotals(items?: CartItem[]) {
  const list = items ?? read();
  const subtotalRial = list.reduce((s, i) => s + i.basePriceRial * i.quantity, 0);
  const totalRial = list.reduce((s, i) => s + i.priceRial * i.quantity, 0);
  const discountRial = subtotalRial - totalRial;
  return { subtotalRial, discountRial, totalRial };
}
