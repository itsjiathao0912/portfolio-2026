import type { Metadata } from "next";

// Self-hosted fonts (bundled into /_next/static/media at build time — no
// request to Google Fonts at build or run time). Latin subset only; add
// another subset import here if non-Latin text is ever needed.
import "@fontsource/ibm-plex-sans/latin-400.css";
import "@fontsource/ibm-plex-sans/latin-500.css";
import "@fontsource/ibm-plex-sans/latin-600.css";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portfolio",
  description: "Selected work.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
