import { labOnly } from "@/lib/lab-only";
import type { Metadata } from "next";
import { ApprovedStamp, CareerRail, CareerReceipt, TransactionStream } from "@/components/signature/ledger";

export const metadata: Metadata = {
  title: "Lab · Ledger",
  robots: { index: false, follow: false },
};

export default function LedgerLab() {
  labOnly();
  return (
    <main className="bg-[var(--bg)] pb-32">
      <header className="mx-auto max-w-3xl px-6 pb-10 pt-28">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Lab · ledger lane</p>
        <h1 className="mt-2 text-4xl font-semibold text-[var(--ink-1)]">A career, settled like a ledger</h1>
      </header>

      <TransactionStream />

      <section className="mx-auto grid max-w-5xl gap-10 px-6 py-24 md:grid-cols-2">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold text-[var(--ink-1)]">Results, signed off</h2>
          <p className="mt-2 text-[var(--ink-3)]">Stamps drop onto real outcomes as they scroll in.</p>
          <div className="mt-8 space-y-10">
            <Result value="30%" label="ad revenue uplift at Zalo, within six months">
              <ApprovedStamp size={132} tone="approved" sublabel="Zalo · A/B tested" />
            </Result>
            <Result value="95%" label="first-pass UAT at ReOrc AI">
              <ApprovedStamp size={132} tone="shipped" sublabel="ReOrc AI" rotate={6} />
            </Result>
            <Result value="2nd" label="place, AABW Fintech track (Cortex Sentinel)">
              <ApprovedStamp size={132} tone="compliant" sublabel="AML · AABW" rotate={-4} />
            </Result>
          </div>
        </div>
        <CareerReceipt />
      </section>

      <CareerRail />
    </main>
  );
}

function Result({ value, label, children }: { value: string; label: string; children: React.ReactNode }) {
  return (
    <div className="relative flex items-center justify-between gap-4 rounded-[var(--radius)] border border-[var(--hairline)] p-5 [&>*:last-child]:shrink-0">
      <div className="min-w-0">
        <p className="text-4xl font-semibold text-[var(--ink-1)] tabular-nums">{value}</p>
        <p className="text-sm text-[var(--ink-3)]">{label}</p>
      </div>
      {children}
    </div>
  );
}
