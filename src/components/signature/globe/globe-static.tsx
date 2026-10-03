import { ARCS, PLACES, placeById } from "./routes";
import { arcPoints, fibonacciSphere, isLand, latLonToVec, project, rotate, vecToLatLon } from "./geo";

// Static SVG version of the globe: same projection, fixed rotation. Used for
// reduced motion, no-canvas, and as the pre-hydration placeholder (so the
// slot never shifts layout).
const S = 400, R = 168, YAW = (-100 * Math.PI) / 180, TILT = 0.3;
const P = (lat: number, lon: number) => project(rotate(latLonToVec(lat, lon), YAW, TILT), S / 2, S / 2, R);

const dots = fibonacciSphere(1400)
  .filter((v) => { const { lat, lon } = vecToLatLon(v); return isLand(lat, lon); })
  .map((v) => project(rotate(v, YAW, TILT), S / 2, S / 2, R))
  .filter((p) => p.z > 0)
  .map((p) => ({ x: +(p.x - 1).toFixed(1), y: +(p.y - 1).toFixed(1), o: +(0.25 + p.z * 0.65).toFixed(2) }));

const arcs = ARCS.map((c) => {
  const a = placeById(c.from), b = placeById(c.to);
  const pts = arcPoints(latLonToVec(a.lat, a.lon), latLonToVec(b.lat, b.lon), 32)
    .map((v) => project(rotate(v, YAW, TILT), S / 2, S / 2, R))
    .filter((p) => p.z > -0.05);
  return { c, d: pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ") };
});

export function GlobeStatic({ activeId, tone = "dark" }: { activeId?: string | null; tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="absolute inset-0 h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="sg-ocean" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#1e3a8a" />
          <stop offset="1" stopColor="#0b1b4a" />
        </radialGradient>
      </defs>
      <circle cx={S / 2} cy={S / 2} r={R} fill={light ? "#f7f7f7" : "url(#sg-ocean)"} stroke={light ? "rgba(11,21,51,0.1)" : undefined} />
      {dots.map((p, i) => (
        <rect key={i} x={p.x} y={p.y} width={2} height={2} fill={light ? "#6b6c72" : "#bfdbfe"} opacity={light ? +(p.o * 0.5).toFixed(2) : p.o} />
      ))}
      {arcs.map(({ c, d }) => (
        <path key={c.id} d={d} fill="none" stroke={light ? "#2563eb" : c.color} strokeWidth={activeId === c.id ? 3 : 1.8} strokeLinecap="round" />
      ))}
      {PLACES.map((pl) => {
        const p = P(pl.lat, pl.lon);
        if (p.z <= 0.05) return null;
        return <circle key={pl.id} cx={+p.x.toFixed(1)} cy={+p.y.toFixed(1)} r={light ? 4 : 3} fill={light ? "#0b1533" : "#fff"} />;
      })}
    </svg>
  );
}
