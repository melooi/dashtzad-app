import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPdpData } from "@/views/product/single-design/pdp-data";
import { buildPdpMarkup, galleryPayload } from "@/views/product/single-design/pdp-markup";
import { SingleProductDesign } from "@/views/product/single-design/SingleProductDesign";

/**
 * Site product page — the design PDP wired to real product data.
 *
 * Core fields (title, code, category, weights/packaging + prices, gallery,
 * related, reviews, Q&A) come from the database and are editable in the existing
 * admin. The richer marketing blocks (taste profile, nutrition, care, per-product
 * FAQ) still render the design's static content and get their own data + admin in
 * follow-up steps. The previous data-wired page is preserved at
 * src/views/product/single-design/original-pdp-page.txt.
 */

export const dynamic = "force-dynamic";

function plainText(html: string | null): string | undefined {
  if (!html) return undefined;
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPdpData(slug);
  if (!data) return { title: "محصول یافت نشد", robots: { index: false, follow: true } };
  return {
    title: `${data.title} — دشت‌زاد`,
    description: plainText(data.descriptionHtml),
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPdpData(slug);
  if (!data) notFound();

  return <SingleProductDesign markup={buildPdpMarkup(data)} gallery={galleryPayload(data)} />;
}
