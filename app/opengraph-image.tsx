import { ImageResponse } from "next/og";
import { OgCard, OG_SIZE } from "@/lib/seo/og-card";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name} — discover & compare coaching batches`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <OgCard
        title="Discover & compare coaching batches"
        subtitle="Verified institutes, honest fees, zero guesswork."
      />
    ),
    { ...size },
  );
}
