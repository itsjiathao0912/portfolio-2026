"use client";
import dynamic from "next/dynamic";
import site from "../../../../content/site";
import { Greeting, LazyMount, ParticipateProvider, StampPassport, VisitorPicker, usePassport, usePersona } from "@/components/signature/participate";

const BuildAProduct = dynamic(() => import("@/components/signature/participate/build-a-product").then((m) => m.BuildAProduct), { ssr: false });
const SendACoin = dynamic(() => import("@/components/signature/participate/send-a-coin").then((m) => m.SendACoin), { ssr: false });
const BuildNextPoll = dynamic(() => import("@/components/signature/participate/build-next-poll").then((m) => m.BuildNextPoll), { ssr: false });

function OrderDemo() {
  const { order, persona } = usePersona();
  const { collect } = usePassport();
  return (
    <div className="rounded-2xl border border-hairline p-4 text-sm text-ink-3">
      <p>usePersona() section order{persona ? ` for ${persona}` : ""}: <span className="font-mono text-ink-1">{order.join(" → ")}</span></p>
      <button type="button" onClick={() => collect("explorer")} className="mt-2 underline underline-offset-4 hover:text-ink-1">Demo: a hidden gem calls collect(&quot;explorer&quot;)</button>
    </div>
  );
}

export function LabParticipate() {
  const email = site.profile.email;
  const linkedin = site.profile.socials.find((s) => s.label === "LinkedIn")?.href ?? "https://www.linkedin.com/";
  return (
    <ParticipateProvider>
      <main className="mx-auto max-w-4xl space-y-8 px-4 pb-24 pt-28 sm:px-6">
        <Greeting />
        <VisitorPicker email={email} />
        <OrderDemo />
        <LazyMount minHeight={520}><BuildAProduct /></LazyMount>
        <LazyMount minHeight={330}><SendACoin email={email} linkedin={linkedin} /></LazyMount>
        <LazyMount minHeight={400}><BuildNextPoll /></LazyMount>
        <StampPassport email={email} />
      </main>
    </ParticipateProvider>
  );
}
