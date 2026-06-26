import { BadgeCheck, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { StoreTrustCard } from "@/components/storefront/StoreTrustCard";

// The four real Dashtzad promises — static brand copy (not product data, not
// fabricated stats). One source so PLP/PDP/about don't redefine them.
const PROMISES = [
  { icon: <BadgeCheck className="size-5" />, title: "اصالت محصول", text: "تضمین کیفیت و اصالت دشت‌زاد" },
  { icon: <PackageCheck className="size-5" />, title: "بسته‌بندی مطمئن", text: "بسته‌بندی بهداشتی و استاندارد" },
  { icon: <Truck className="size-5" />, title: "ارسال مطمئن", text: "ارسال به سراسر کشور" },
  { icon: <ShieldCheck className="size-5" />, title: "پشتیبانی", text: "همراه شما تا پس از خرید" },
];

/**
 * Row of trust cards. `framed` wraps it in a titled "چرا دشت‌زاد؟" panel
 * (used to give listing pages weight); unframed is a plain 4-up band.
 */
export function StoreTrustBand({
  framed = false,
  className = "",
}: {
  framed?: boolean;
  className?: string;
}) {
  const grid = (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {PROMISES.map((p) => (
        <StoreTrustCard key={p.title} icon={p.icon} title={p.title} text={p.text} />
      ))}
    </div>
  );

  if (!framed) return <div className={className}>{grid}</div>;

  return (
    <section className={`rounded-3xl border border-store-border-soft bg-store-surface-warm p-6 md:p-8 ${className}`}>
      <div className="mb-5 flex items-center gap-2.5">
        <span className="store-section-bar" aria-hidden />
        <h2 className="font-heading text-xl font-bold text-store-text">چرا دشت‌زاد؟</h2>
      </div>
      {grid}
    </section>
  );
}
