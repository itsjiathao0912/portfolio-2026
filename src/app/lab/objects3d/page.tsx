import { labOnly } from "@/lib/lab-only";
import type { Metadata } from "next";
import { ComplianceShield, ScrollPhone, StoryTokens, type PhoneScreen } from "@/components/signature/objects3d";

export const metadata: Metadata = {
  title: "Lab · 3D objects",
  robots: { index: false, follow: false },
};

const SCREENS: PhoneScreen[] = [
  { src: "/work/ledgr/home-mobile.webp", alt: "Ledgr home screen", caption: "Ledgr home", project: "Ledgr" },
  { src: "/work/ledgr/check-mobile.webp", alt: "Ledgr document check screen", caption: "Check a compliance document", project: "Ledgr" },
  { src: "/work/ledgr/pricing-mobile.webp", alt: "Ledgr pricing screen", caption: "Pricing", project: "Ledgr" },
  { src: "/work/gocrypto/screen-1.webp", alt: "GoCrypto app screen 1", caption: "GoCrypto app", project: "GoCrypto" },
  { src: "/work/gocrypto/screen-2.webp", alt: "GoCrypto app screen 2", caption: "GoCrypto app", project: "GoCrypto" },
  { src: "/work/gocrypto/screen-3.webp", alt: "GoCrypto app screen 3", caption: "GoCrypto app", project: "GoCrypto" },
];

export default function Objects3DLab() {
  labOnly();
  return (
    <main style={{ maxWidth: 1120, margin: "0 auto", padding: "120px 16px 80px" }}>
      <h1 style={{ marginBottom: 8 }}>3D objects lab</h1>
      <p style={{ color: "#6b6c72", marginBottom: 40 }}>Story tokens, compliance shield and scroll phone.</p>

      <h2>Story tokens</h2>
      <StoryTokens />

      <h2 style={{ marginTop: 64 }}>Compliance shield</h2>
      <ComplianceShield />

      <div style={{ marginTop: 64 }}>
        <ScrollPhone title="Shipped screens" screens={SCREENS} />
      </div>
      <p style={{ height: "40vh" }}>End of lab.</p>
    </main>
  );
}
