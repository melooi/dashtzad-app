import { GlobalSettingPage } from "@/components/admin/globals/GlobalSettingPage";

export const dynamic = "force-dynamic";

export default function Page() {
  return <GlobalSettingPage globalKey="siteSettings" />;
}
