import { notFound } from "next/navigation";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { GLOBAL_LABELS } from "@/lib/admin/nav";

export default async function GlobalPlaceholder({
  params,
}: {
  params: Promise<{ global: string }>;
}) {
  const { global } = await params;
  const label = GLOBAL_LABELS[global];
  if (!label) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-dz-a-primary-800 dark:text-dz-a-night-fg">{label}</h1>
      <AdminEmptyState
        title={`تنظیمات «${label}»`}
        description="این بخش از تنظیمات سراسری در checkpointهای بعدی فعال می‌شود."
      />
    </div>
  );
}
