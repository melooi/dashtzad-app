"use client";

import { useEffect, useRef } from "react";
import { PDP_SCRIPT } from "./script";

/**
 * Renders the data-driven PDP markup (built server-side from real product data)
 * and runs the design's interaction script after mount. CSS is loaded
 * route-locally via React 19 <link> tags from /public/dz-design, with the
 * design reset + tokens scoped to `.dz-pdp-page` so the site header/footer stay
 * untouched. Real gallery images are handed to the script via window.__PDP_GALLERY.
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
    <>
      <link rel="stylesheet" href="/dz-design/fonts/remixicon/remixicon.css" />
      <link rel="stylesheet" href="/dz-design/css/app.css" />
      <link rel="stylesheet" href="/dz-design/css/components/product/product-card.css" />
      <link rel="stylesheet" href="/dz-design/css/components/product/single-product.css" />
      <link rel="stylesheet" href="/dz-design/css/pdp-scope.css" />
      <div className="dz-pdp-page" dangerouslySetInnerHTML={{ __html: markup }} />
    </>
  );
}
