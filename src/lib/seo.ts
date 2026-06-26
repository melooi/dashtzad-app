import type { Metadata } from "next";

export const SITE_NAME = "دشت‌زاد";
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || "http://localhost:3000";

type BuildArgs = {
  title: string;
  description: string;
  url: string; // path, e.g. "/products"
  image?: string; // absolute or path; defaults to the dynamic OG image
  type?: "website" | "article" | "product";
  noindex?: boolean;
};

/** Build a complete Metadata object with Open Graph, Twitter, and canonical. */
export function buildMetadata({
  title,
  description,
  url,
  image,
  type = "website",
  noindex = false,
}: BuildArgs): Metadata {
  const canonical = url.startsWith("http") ? url : `${BASE_URL}${url}`;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${BASE_URL}${image}`
    : `${BASE_URL}/opengraph-image`;
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  return {
    title: fullTitle,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      title: fullTitle,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: "fa_IR",
      type: type === "product" ? "website" : type,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
    },
  };
}
