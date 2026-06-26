"use client";

import { useEffect, useRef } from "react";
import { PDP_SCRIPT } from "./script";

/**
 * Renders the data-driven PDP markup (built server-side from real product data)
 * and runs the design's interaction script after mount. CSS is bundled via
 * globals.css (src/styles/storefront/pdp-tokens|dz-product-card|single-product|pdp-scope),
 * scoped to `.dz-pdp-page` so the site header/footer stay untouched.
 * Real gallery images are handed to the script via window.__PDP_GALLERY.
 */
export function SingleProductDesign({
  markup,
  gallery,
}: {
  markup: string;
  gallery: { url: string; label: string }[];
}) {
  const ranRef = useRef(false);

  useEffect(() => {
    if (ranRef.current) return;
    ranRef.current = true;
    (window as unknown as { __PDP_GALLERY?: unknown }).__PDP_GALLERY = gallery;
    const el = document.createElement("script");
    el.textContent = PDP_SCRIPT;
    document.body.appendChild(el);
    return () => {
      el.remove();
    };
  }, [gallery]);

  return (
    <div className="dz-pdp-page" dangerouslySetInnerHTML={{ __html: markup }} />
  );
}
