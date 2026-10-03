import { cn } from "@/lib/utils";

export interface LightBeamProps extends React.HTMLAttributes<HTMLDivElement> {
  radius?: number;
  /** Beam colour. */
  color?: string;
  /** Seconds for one sweep. */
  duration?: number;
  /** Sweep once on view (default) or loop forever. */
  loop?: boolean;
}

/**
 * CSS-only light beam sweeping round the border, then the content "powers on".
 * Uses scroll-driven `animation-timeline: view()` where supported; otherwise
 * plays once on load. Reduced motion: no beam, content shown at once.
 * Styles are scoped in a <style> tag so globals.css is untouched.
 */
export function LightBeam({ radius = 20, color = "#60a5fa", duration = 2.4, loop = false, className, style, children, ...rest }: LightBeamProps) {
  return (
    <div
      data-light-beam={loop ? "loop" : "once"}
      className={cn("sig-beam relative flex flex-col", className)}
      style={{ ...style, borderRadius: radius, ["--beam" as string]: color, ["--beam-dur" as string]: `${duration}s` }}
      {...rest}
    >
      <span aria-hidden="true" className="sig-beam-ring" />
      <div className="sig-beam-body relative flex flex-1 flex-col [&>*]:flex-1">{children}</div>
    </div>
  );
}

/** Render once per page (the lab and the integrator do this). */
export function LightBeamStyles() {
  return (
    <style>{`
@property --beam-a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }
.sig-beam-ring { position:absolute; inset:0; border-radius:inherit; padding:1.5px; pointer-events:none;
  background: conic-gradient(from var(--beam-a), transparent 0 70%, var(--beam) 85%, #fff 88%, transparent 92%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor; mask-composite: exclude;
  animation: sig-beam-spin var(--beam-dur) var(--ease-out, ease-out) 1 both; }
.sig-beam[data-light-beam="loop"] .sig-beam-ring { animation-iteration-count: infinite; animation-timing-function: linear; }
.sig-beam-body { animation: sig-beam-on calc(var(--beam-dur) * .6) ease-out calc(var(--beam-dur) * .35) both; }
@supports (animation-timeline: view()) {
  .sig-beam[data-light-beam="once"] .sig-beam-ring, .sig-beam[data-light-beam="once"] .sig-beam-body {
    animation-timeline: view(); animation-range: entry 10% cover 45%; animation-delay: 0s; }
}
@keyframes sig-beam-spin { from { --beam-a: 0deg; opacity: 1 } 90% { opacity: 1 } to { --beam-a: 360deg; opacity: .25 } }
@keyframes sig-beam-on { from { opacity:.35; filter: saturate(.2) brightness(.95) } to { opacity:1; filter:none } }
@media (prefers-reduced-motion: reduce) { .sig-beam-ring { display:none } .sig-beam-body { animation:none } }
`}</style>
  );
}
