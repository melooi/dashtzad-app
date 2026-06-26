import { notFound } from "next/navigation";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { COLLECTION_LABELS } from "@/lib/admin/nav";

export default async function CollectionPlaceholder({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const label = COLLECTION_LABELS[collection];
  if (!label) notFound();

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-dz-primary-800 dark:text-dz-night-fg">{label}</h1>
      <AdminEmptyState
        title={`مدیریت «${label}»`}
        description="این مجموعه در checkpointهای بعدی فعال می‌شود (ایجاد/ویرایش/حذف)."
      />
    </div>
  );
}
