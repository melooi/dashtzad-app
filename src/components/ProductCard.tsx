// Back-compat shim. The product card is now a component-driven system under
// components/storefront/product-card/. Existing imports of `ProductCard` /
// `ProductCardData` keep working; new code can import richer variants directly.
export { ProductCard } from "@/components/storefront/product-card/ProductCard";
export type {
  StoreProductCardData as ProductCardData,
  ProductCardVariant,
  QuickAddData,
} from "@/components/storefront/product-card/types";
