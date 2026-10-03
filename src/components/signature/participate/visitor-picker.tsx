"use client";
import { PERSONAS, PERSONA_META, RECRUITER_TLDR } from "./logic";
import { usePassport, usePersona } from "./store";
import { card, eyebrow } from "./fx";

/** "Who's visiting?" — sets the persona other sections read via usePersona(). */
export function VisitorPicker({ email, cvHref }: { email?: string; cvHref?: string }) {
  const { persona, setPersona } = usePersona();
  const { collect } = usePassport();
  return (
    <section className={card} aria-labelledby="vp-title">
      <p className={eyebrow}>Make it yours</p>
      <h2 id="vp-title" className="mt-2 text-2xl font-semibold text-ink-1 sm:text-3xl">Who&apos;s visiting?</h2>
      <p className="mt-1 text-ink-3">Pick one and the page puts what you care about first. Saved only in your browser.</p>
      <div role="radiogroup" aria-label="Visitor type" className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PERSONAS.map((p) => {
          const on = persona === p;
          return (
            <button
              key={p}
              role="radio"
              aria-checked={on}
              onClick={() => { setPersona(on ? null : p); collect("persona"); }}
              className={`group rounded-2xl border p-4 text-left transition duration-300 ease-[var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none ${
                on ? "border-accent bg-accent-tint shadow-[var(--shadow-card-hover)] -translate-y-0.5 motion-reduce:translate-y-0" : "border-hairline bg-bg hover:-translate-y-0.5 hover:border-border-strong motion-reduce:hover:translate-y-0"
              }`}
            >
              <span aria-hidden className="block text-2xl transition-transform duration-300 group-hover:scale-110 motion-reduce:group-hover:scale-100">{PERSONA_META[p].emoji}</span>
              <span className="mt-2 block font-semibold text-ink-1">{PERSONA_META[p].label}</span>
              <span className="block text-sm text-ink-3">{PERSONA_META[p].blurb}</span>
            </button>
          );
        })}
      </div>
      <div aria-live="polite">
        {persona === "recruiter" && <RecruiterTLDR email={email} cvHref={cvHref} />}
      </div>
    </section>
  );
}

/** The 30-second card. Content is sourced (see RECRUITER_TLDR in logic.ts). */
export function RecruiterTLDR({ email, cvHref }: { email?: string; cvHref?: string }) {
  return (
    <div className="mt-6 rounded-2xl bg-[#0a1f44] p-5 text-white sm:p-6 animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">30-second TL;DR</p>
        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs">⏱ 30s</span>
      </div>
      <ul className="mt-3 space-y-2">
        {RECRUITER_TLDR.map((l, i) => (
          <li key={l} className="flex gap-2 text-[15px] leading-snug">
            <span aria-hidden className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-sky-400/20 text-[11px] text-sky-200">{i + 1}</span>
            {l}
          </li>
        ))}
      </ul>
      {(email || cvHref) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {email && <a href={`mailto:${email}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#0a1f44] hover:bg-sky-100">Email Thao</a>}
          {cvHref && <a href={cvHref} className="rounded-full border border-white/30 px-4 py-2 text-sm font-semibold hover:bg-white/10">Download CV</a>}
        </div>
      )}
    </div>
  );
}
