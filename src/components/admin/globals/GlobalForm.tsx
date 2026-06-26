"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getGlobalConfig, type GlobalFieldDef } from "@/lib/admin/globals";
import { AdminFormSection } from "@/components/admin/ui/AdminFormSection";
import { AdminFormError } from "@/components/admin/ui/AdminFormError";
import { AdminSuccessNotice } from "@/components/admin/ui/AdminSuccessNotice";
import { AdminSubmitBar } from "@/components/admin/ui/AdminSubmitBar";
import { AdminFormNavigator, type FormNavItem } from "@/components/admin/ui/AdminFormNavigator";
import { GlobalFieldInput, type FieldContext } from "./GlobalFieldInput";
import { SeoPreview } from "./SeoPreview";
import { saveGlobal } from "@/app/admin/globals/actions";

const FULL_WIDTH = new Set(["textarea", "objectList", "stringList", "products", "categories", "image"]);

/**
 * Generic, config-driven editor for a single global. Holds state as a plain
 * object and saves the whole object via the guarded `saveGlobal` action.
 */
export function GlobalForm({
  globalKey,
  initialData,
  ctx,
}: {
  globalKey: string;
  initialData: Record<string, unknown>;
  ctx: FieldContext;
}) {
  const config = getGlobalConfig(globalKey)!;
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown>>(initialData);
  const [dirty, setDirty] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const setField = (name: string, value: unknown) => {
    setData((d) => ({ ...d, [name]: value }));
    setDirty(true);
    setSuccess(null);
  };

  const submit = () => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = await saveGlobal(globalKey, data);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSuccess("تغییرات با موفقیت ذخیره شد.");
      setDirty(false);
      router.refresh();
    });
  };

  const renderField = (f: GlobalFieldDef) => {
    if (f.type === "checkbox") {
      return (
        <div key={f.name} className={FULL_WIDTH.has(f.type) ? "sm:col-span-2" : ""}>
          <GlobalFieldInput def={f} value={data[f.name]} ctx={ctx} onChange={(v) => setField(f.name, v)} />
          {f.hint && <span className="mt-1 block text-xs text-dz-primary-400 dark:text-dz-night-faint">{f.hint}</span>}
        </div>
      );
    }
    return (
      <div key={f.name} className={FULL_WIDTH.has(f.type) ? "sm:col-span-2" : ""}>
        <label htmlFor={`gf-${f.name}`} className="mb-1.5 block text-sm font-medium text-dz-primary-800 dark:text-dz-night-fg">
          {f.label}
        </label>
        <GlobalFieldInput def={f} value={data[f.name]} ctx={ctx} onChange={(v) => setField(f.name, v)} />
        {f.hint && <span className="mt-1 block text-xs text-dz-primary-400 dark:text-dz-night-faint">{f.hint}</span>}
      </div>
    );
  };

  const visibleSections = config.sections.filter(
    (section) => config.fields.some((f) => f.section === section.key),
  );
  const navItems: FormNavItem[] = visibleSections.map((s) => ({ id: `gs-${s.key}`, label: s.title }));

  return (
    <div className="mx-auto max-w-3xl lg:grid lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start lg:gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex min-w-0 flex-col gap-5"
      >
        <AdminFormError message={error} />
        <AdminSuccessNotice message={success} onDismiss={() => setSuccess(null)} />

        {globalKey === "seoDefaults" && <SeoPreview data={data} />}

        {visibleSections.map((section) => {
          const fields = config.fields.filter((f) => f.section === section.key);
          return (
            <AdminFormSection key={section.key} id={`gs-${section.key}`} title={section.title} description={section.description}>
              <div className="grid gap-4 sm:grid-cols-2">{fields.map(renderField)}</div>
            </AdminFormSection>
          );
        })}

        <AdminSubmitBar
          submitting={pending}
          dirty={dirty}
          onCancel={() => {
            setData(initialData);
            setDirty(false);
            setSuccess(null);
            setError(null);
          }}
          cancelLabel="بازگردانی"
          saveLabel="ذخیره‌ی تغییرات"
        />
      </form>
      <AdminFormNavigator items={navItems} />
    </div>
  );
}
