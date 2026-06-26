import { requireAdmin } from "@/lib/auth/guards";
import { getGlobalConfig } from "@/lib/admin/globals";
import { readGlobalRaw, loadFieldContext, ctxFlagsForGlobal } from "@/lib/admin/global-service";
import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { GlobalForm } from "./GlobalForm";

/** Server wrapper that loads a generic global + its relation context. */
export async function GlobalSettingPage({ globalKey }: { globalKey: string }) {
  await requireAdmin();
  const cfg = getGlobalConfig(globalKey)!;
  const [data, ctx] = await Promise.all([
    readGlobalRaw(globalKey),
    loadFieldContext(ctxFlagsForGlobal(globalKey)),
  ]);

  return (
    <div>
      <AdminPageHeader
        title={cfg.label}
        description={cfg.description}
        breadcrumbs={[{ label: "پنل مدیریت", href: "/admin/dashboard" }, { label: cfg.label }]}
      />
      <GlobalForm globalKey={globalKey} initialData={data} ctx={ctx} />
    </div>
  );
}
