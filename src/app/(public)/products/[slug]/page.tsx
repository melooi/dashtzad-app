import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPdpData } from "@/views/product/single-design/pdp-data";
import { buildPdpMarkup, galleryPayload } from "@/views/product/single-design/pdp-markup";
import { SingleProductDesign } from "@/views/product/single-design/SingleProductDesign";
import { StructuredData } from "@/components/StructuredData";
import { productJsonLd, breadcrumbSchema } from "@/lib/jsonld";
import { buildEntityMetadata } from "@/lib/seo/meta";

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
  return buildEntityMetadata("PRODUCT", data.id, {
    title: data.title,
    description: plainText(data.descriptionHtml) ?? data.title,
    path: `/products/${data.slug}`,
    image: data.images[0]?.url ?? null,
    type: "product",
  });
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getPdpData(slug);
  if (!data) notFound();

  // Build breadcrumb items
  const crumbs = [
    { name: "خانه", url: "/" },
    { name: "فروشگاه", url: "/products" },
    ...(data.categoryTitle && data.categorySlug
      ? [{ name: data.categoryTitle, url: `/products?cat=${data.categorySlug}` }]
      : []),
    { name: data.title, url: `/products/${data.slug}` },
  ];

  // Derive cheapest active weight for Product schema price
  const cheapestWeight = data.weights[0];
  const priceRial = cheapestWeight ? cheapestWeight.priceToman * 10 : 0;
  const offPriceRial = cheapestWeight?.oldToman ? cheapestWeight.oldToman * 10 : null;

  const ldSchema = [
    productJsonLd({
      title: data.title,
      slug: data.slug,
      description: plainText(data.descriptionHtml) ?? data.title,
      brand: data.brand,
      category: data.categoryTitle,
      priceRial,
      offPriceRial,
      countInStock: data.inStock ? 1 : 0,
      images: data.images.map((i) => i.url),
      approvedReviewCount: data.numReviews > 0 ? data.numReviews : undefined,
      rating: data.ratingShown ?? undefined,
    }),
    breadcrumbSchema(crumbs),
  ];

  return (
    <>
      <StructuredData data={ldSchema} />
      <SingleProductDesign markup={buildPdpMarkup(data)} gallery={galleryPayload(data)} />
    </>
  );
}
