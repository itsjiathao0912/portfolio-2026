import type { Metadata, Viewport } from "next";

// Self-hosted fonts (bundled into /_next/static/media at build time — never a
// font CDN). Each import registers every subset (latin, latin-ext, vietnamese
// …) via unicode-range, so the browser downloads the Vietnamese file only when
// a Vietnamese letter (e.g. "Thảo") is on the page. Do NOT switch these to the
// `latin-*.css` files: Vietnamese text would silently fall back.
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/inter/wght.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "./globals.css";

import { SecretWord } from "@/components/gems/secret-word";
import { ParticipateProvider } from "@/components/signature/participate/store";
import { MotionProvider } from "@/components/motion/motion-provider";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { loadSite } from "@/lib/load";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_TITLE } from "@/lib/seo/site-meta";
import { SITE_URL } from "@/lib/seo/site-url";

// Every page reads the database per request; there is no Cloudflare context at
// build time, so nothing may be prerendered.
export const dynamic = "force-dynamic";

// Static (no DB read) so the head is identical at build and request time.
// Pages override title/description/canonical via src/lib/seo/metadata.ts; the
// share image for each route is its colocated opengraph-image file.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "en_US",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = await loadSite();
  const profile = site?.profile ?? null;
  const linkedin = profile?.socials.find((s) => s.label === "LinkedIn")?.href ?? null;

  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="sr-only z-[60] rounded-full bg-ink-1 px-4 py-2 text-bg focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <MotionProvider>
          <ParticipateProvider>
          <SiteNav name={profile?.name ?? "Thao Dao"} email={profile?.email ?? ""} linkedin={linkedin} />
          <div id="main" className="flex-1">
            {children}
          </div>
          <SiteFooter profile={profile} />
          <SecretWord />
          </ParticipateProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
