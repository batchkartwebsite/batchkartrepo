import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { JsonLd } from "@/components/seo/json-ld";
import { organizationSchema, websiteSchema } from "@/lib/seo/structured-data";
import { OG_IMAGE, TWITTER_IMAGE } from "@/lib/seo/metadata";
import { siteConfig } from "@/config/site";
import { env } from "@/config/env";

// Fraunces — characterful editorial serif for display headlines.
const display = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
  display: "swap",
});
// Hanken Grotesk — clean, warm grotesque for body/UI.
const sans = Hanken_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-hanken",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Discover & compare coaching batches`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    "coaching batches",
    "NEET coaching",
    "JEE coaching",
    "UPSC coaching",
    "compare coaching",
    "coaching fees",
    "coaching institutes India",
  ],
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_IN",
    url: siteConfig.url,
    title: `${siteConfig.name} — Discover & compare coaching batches`,
    description: siteConfig.description,
    images: [OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} — Discover & compare coaching batches`,
    description: siteConfig.description,
    images: [TWITTER_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${display.variable}`}>
      <body className="min-h-screen antialiased">
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
        {/* Vercel analytics self-disable on localhost; GA loads in production only. */}
        <Analytics />
        <SpeedInsights />
        {process.env.NODE_ENV === "production" && env.NEXT_PUBLIC_GA_ID ? (
          <GoogleAnalytics gaId={env.NEXT_PUBLIC_GA_ID} />
        ) : null}
      </body>
    </html>
  );
}
