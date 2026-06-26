import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "دشت‌زاد — مواد غذایی پرمیوم ایرانی";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Default Open Graph image — brand on an olive background. Used as the fallback
// for every page that does not provide its own OG image.
export default async function Image() {
  const kalameh = await readFile(
    join(process.cwd(), "public/fonts/kalameh/KalamehWeb-Bold.woff"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 24,
          background: "linear-gradient(135deg, #4a6340 0%, #2e3d29 100%)",
          fontFamily: "Kalameh",
          direction: "rtl",
        }}
      >
        <div style={{ fontSize: 130, color: "#ffffff", fontWeight: 700 }}>دشت‌زاد</div>
        <div style={{ fontSize: 40, color: "#e1e9db" }}>
          از ۱۳۱۳ — مواد غذایی پرمیوم ایرانی
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Kalameh", data: kalameh, weight: 700, style: "normal" }],
    },
  );
}
