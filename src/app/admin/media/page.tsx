import { listMediaAssets } from "@/lib/admin/media";
import { MediaLibraryPage } from "@/components/admin/media/MediaLibraryPage";

// Always read fresh — uploads/edits happen via actions and a route handler.
export const dynamic = "force-dynamic";

export default async function MediaPage() {
  const assets = await listMediaAssets({ take: 500 });
  return <MediaLibraryPage initialAssets={assets} />;
}
