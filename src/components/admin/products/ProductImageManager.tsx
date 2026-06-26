"use client";

/* eslint-disable @next/next/no-img-element */
import { useState, useTransition } from "react";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { MediaPickerDialog } from "@/components/admin/media/MediaPickerDialog";
import { addProductImageAction, removeProductImageAction } from "@/app/admin/collections/products/actions";

export type ImageItem = { id: string; url: string; alt: string | null };

export function ProductImageManager({
  productId,
  initialImages,
}: {
  productId: string;
  initialImages: ImageItem[];
}) {
  const [images, setImages] = useState<ImageItem[]>(initialImages);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  const handlePick = (asset: { id?: string; url: string; alt?: string | null }) => {
    setOpen(false);
    start(async () => {
      const res = await addProductImageAction(productId, asset.url, asset.alt ?? undefined);
      if (res.ok) {
        setImages((prev) => [
          ...prev,
          { id: `temp-${Date.now()}`, url: asset.url, alt: asset.alt ?? null },
        ]);
      }
    });
  };

  const handleRemove = (imageId: string) => {
    start(async () => {
      const res = await removeProductImageAction(imageId, productId);
      if (res.ok) setImages((prev) => prev.filter((img) => img.id !== imageId));
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        {images.map((img) => (
          <div
            key={img.id}
            className="group relative size-24 overflow-hidden rounded-xl border border-dz-a-primary-200 bg-dz-a-primary-50/50 dark:border-dz-a-night-border dark:bg-white/5"
          >
            <img src={img.url} alt={img.alt ?? ""} className="size-full object-contain p-1" />
            <button
              type="button"
              disabled={pending}
              onClick={() => handleRemove(img.id)}
              className="absolute right-1 top-1 hidden size-5 items-center justify-center rounded-full bg-dz-a-error text-white hover:opacity-90 group-hover:flex disabled:opacity-60"
              title="حذف تصویر"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        <button
          type="button"
          disabled={pending}
          onClick={() => setOpen(true)}
          className="flex size-24 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-dz-a-primary-300 text-dz-a-primary-400 transition-colors hover:border-dz-a-primary-500 hover:bg-dz-a-primary-50/50 hover:text-dz-a-primary-600 disabled:opacity-60 dark:border-dz-a-night-border dark:text-dz-a-night-faint dark:hover:bg-white/5"
        >
          {pending ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <>
              <ImagePlus className="size-5" />
              <span className="text-xs">افزودن</span>
            </>
          )}
        </button>
      </div>

      <MediaPickerDialog
        open={open}
        usage="PRODUCT"
        onClose={() => setOpen(false)}
        onPick={(asset) => handlePick(asset)}
      />
    </div>
  );
}
