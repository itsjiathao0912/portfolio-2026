"use client";
import { STAMPS, STAMP_META, type StampId } from "./logic";
import { useReducedMotion, usePassport } from "./store";
import { Confetti, card } from "./fx";

function Stamp({ id, got, fresh }: { id: StampId; got: boolean; fresh: boolean }) {
  const m = STAMP_META[id];
  return (
    <li className="grid place-items-center" aria-label={`${m.label} stamp ${got ? "collected" : "not yet collected"}`}>
      <div
        className={`grid h-20 w-20 place-items-center rounded-full border-[3px] border-dashed text-center text-[11px] font-bold uppercase tracking-wider ${got ? "" : "border-hairline text-ink-3/50"} ${fresh ? "animate-in zoom-in-150 fade-in duration-500 motion-reduce:animate-none" : ""}`}
        style={got ? { borderColor: m.color, color: m.color, transform: `rotate(${(id.length % 5) * 4 - 8}deg)`, background: `${m.color}12` } : undefined}
      >
        {got ? m.label : "?"}
      </div>
    </li>
  );
}

/**
 * Collectible passport. Other gems call `usePassport().collect(id)`.
 * When every stamp is collected, a secret ending appears.
 */
export function StampPassport({ email }: { email?: string }) {
  const { stamps, complete, lastStamp } = usePassport();
  const reduced = useReducedMotion();
  return (
    <section className={`${card} bg-gradient-to-br from-[#0a1f44] to-[#132f63] text-white`} aria-labelledby="pp-title">
      <Confetti fire={complete ? 1 : 0} reduced={reduced} />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">Visitor passport</p>
      <h2 id="pp-title" className="mt-2 text-2xl font-semibold text-white sm:text-3xl">{stamps.length} / {STAMPS.length} stamps</h2>
      <p className="mt-1 text-white/70">Collect them by playing around the site.</p>
      <ul className="mt-5 grid grid-cols-3 gap-4 rounded-2xl bg-white p-4 sm:grid-cols-6">
        {STAMPS.map((id) => <Stamp key={id} id={id} got={stamps.includes(id)} fresh={lastStamp === id} />)}
      </ul>
      <div aria-live="polite">
        {complete && (
          <div className="mt-5 rounded-2xl bg-white/10 p-4 animate-in fade-in duration-700 motion-reduce:animate-none">
            <p className="font-semibold">🛂 Secret ending unlocked — you&apos;re cleared for boarding.</p>
            <p className="mt-1 text-sm text-white/80">You explored more than most. Thao would love to hear what you thought{email ? <> — <a className="underline underline-offset-4" href={`mailto:${email}?subject=I%20collected%20every%20stamp`}>tell her</a></> : null}.</p>
          </div>
        )}
      </div>
    </section>
  );
}
