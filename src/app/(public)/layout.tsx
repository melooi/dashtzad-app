import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BottomNav } from "@/components/storefront/chrome/BottomNav";
import { ChatWidget } from "@/components/storefront/chat/ChatWidget";
import { WishlistSync } from "@/components/storefront/WishlistSync";
import { getHeaderData, getFooterData } from "@/lib/site-data";
import { getChatPublicConfig } from "@/lib/chat/service";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [header, footer, chat] = await Promise.all([
    getHeaderData(),
    getFooterData(),
    getChatPublicConfig(),
  ]);

  const chatInNav = chat.enabled && chat.showMobileNav ? { label: chat.mobileCtaLabel } : null;

  return (
    <>
      <Header data={header} chatEnabled={chat.enabled} />
      {/* Mobile bottom-nav clearance (pb only when the nav is shown). */}
      <div className={header.config.showBottomNav ? "flex-1 pb-24 md:pb-0" : "flex-1"}>
        {children}
      </div>
      <Footer data={footer} />
      {header.config.showBottomNav && <BottomNav items={header.bottomNav} chat={chatInNav} />}
      {chat.enabled && <ChatWidget config={chat} />}
      <WishlistSync />
    </>
  );
}
