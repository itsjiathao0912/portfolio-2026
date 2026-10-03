import type { Metadata } from "next";
import { BrandGradient, SettlementGlobe } from "@/components/signature/globe";

export const metadata: Metadata = {
  title: "Lab · Globe",
  robots: { index: false, follow: false },
};

export default function GlobeLabPage() {
  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-24 sm:px-8">
      <BrandGradient className="rounded-[24px] px-6 py-20 text-white sm:px-12">
        <p className="text-sm uppercase tracking-widest text-blue-100/80">Lab · BrandGradient</p>
        <h1 style={{ color: "#fff" }} className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Payments, compliance and growth, across borders.</h1>
      </BrandGradient>
      <SettlementGlobe />
      <div style={{ height: "60vh" }} aria-hidden="true" />
    </main>
  );
}
