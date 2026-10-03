import Image from "next/image";
import { cn } from "@/lib/utils";

type Motif = "billing" | "games" | "lineage";

interface ProjectIllustrationProps {
  motif: Motif;
  /** Product/company logo shown on the centre tile, if we have one. */
  logo?: string | null;
  label: string;
  /** Deep cards draw in white; light cards in navy/accent. */
  tone?: "light" | "deep";
  className?: string;
}

/**
 * Original abstract illustration for projects without public screenshots
 * (internal tools, NDA-era work). Simple shapes that hint at what the product
 * does, plus the logo — never a "screens coming soon" placeholder.
 */
export function ProjectIllustration({ motif, logo, label, tone = "light", className }: ProjectIllustrationProps) {
  const ink = tone === "deep" ? "#ffffff" : "var(--navy)";
  const soft = tone === "deep" ? "rgba(255,255,255,0.18)" : "rgba(11,31,77,0.08)";
  const mid = tone === "deep" ? "rgba(255,255,255,0.4)" : "rgba(11,31,77,0.22)";
  const pop = tone === "deep" ? "#ffd166" : "var(--accent)";

  return (
    <div
      role="img"
      aria-label={`${label} illustration`}
      data-illustration={motif}
      className={cn("relative mx-auto aspect-[4/3] w-full max-w-[460px]", className)}
    >
      <svg viewBox="0 0 400 300" className="absolute inset-0 size-full" aria-hidden="true">
        {motif === "billing" ? <Billing ink={ink} soft={soft} mid={mid} pop={pop} /> : null}
        {motif === "games" ? <Games ink={ink} soft={soft} mid={mid} pop={pop} /> : null}
        {motif === "lineage" ? <Lineage ink={ink} soft={soft} mid={mid} pop={pop} /> : null}
      </svg>
      {logo ? (
        <span
          className={cn(
            "absolute top-[38%] left-1/2 flex size-[72px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[20px] shadow-[0_18px_40px_-16px_rgba(11,31,77,0.45)]",
            tone === "deep" ? "bg-white" : "bg-bg"
          )}
        >
          <Image src={logo} alt="" width={44} height={44} unoptimized className="h-10 w-10 object-contain" />
        </span>
      ) : null}
    </div>
  );
}

interface Palette {
  ink: string;
  soft: string;
  mid: string;
  pop: string;
}

/** Stacked invoice cards + a rising cost bar chart: multi-provider billing. */
function Billing({ ink, soft, mid, pop }: Palette) {
  return (
    <g>
      <rect x="70" y="70" width="200" height="250" rx="22" fill={soft} transform="rotate(-8 170 195)" />
      <rect x="110" y="55" width="200" height="260" rx="22" fill={soft} transform="rotate(5 210 185)" />
      <rect x="90" y="40" width="220" height="290" rx="22" fill="white" opacity="0.95" />
      <rect x="116" y="70" width="90" height="12" rx="6" fill={ink} />
      <rect x="116" y="92" width="140" height="8" rx="4" fill={mid} />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <circle cx="124" cy={130 + i * 34} r="8" fill={i === 1 ? pop : mid} />
          <rect x="140" y={125 + i * 34} width={70 + ((i * 37) % 60)} height="10" rx="5" fill={mid} />
          <rect x="248" y={125 + i * 34} width="38" height="10" rx="5" fill={ink} opacity="0.7" />
        </g>
      ))}
      <rect x="116" y="270" width="170" height="2" fill={mid} />
      <rect x="230" y="282" width="56" height="14" rx="7" fill={pop} />
    </g>
  );
}

/** A loose grid of rounded game tiles with a highlighted "featured" tile. */
function Games({ ink, soft, mid, pop }: Palette) {
  const tiles = [
    [40, 150, 0],
    [130, 120, 1],
    [220, 150, 0],
    [310, 120, 0],
    [85, 230, 0],
    [175, 210, 2],
    [265, 230, 0],
  ] as const;
  return (
    <g>
      {tiles.map(([x, y, kind], i) => (
        <g key={i} transform={`rotate(${(i % 3) - 1} ${x + 30} ${y + 30})`}>
          <rect x={x} y={y} width="62" height="62" rx="18" fill={kind === 2 ? pop : kind === 1 ? mid : soft} />
          {kind !== 1 ? (
            <path d={`M${x + 24} ${y + 20} L${x + 42} ${y + 31} L${x + 24} ${y + 42} Z`} fill={kind === 2 ? "white" : mid} />
          ) : null}
        </g>
      ))}
      <path d="M60 110 C 140 60, 260 60, 340 105" stroke={mid} strokeWidth="3" strokeDasharray="2 10" strokeLinecap="round" fill="none" />
      <circle cx="340" cy="105" r="6" fill={ink} />
    </g>
  );
}

/** Source → transform → report nodes joined by lineage edges. */
function Lineage({ ink, soft, mid, pop }: Palette) {
  const left = [80, 150, 220];
  return (
    <g>
      {left.map((y) => (
        <path key={y} d={`M96 ${y} C 150 ${y}, 150 150, 200 150`} stroke={mid} strokeWidth="3" fill="none" />
      ))}
      <path d="M200 150 C 250 150, 250 95, 304 95" stroke={mid} strokeWidth="3" fill="none" />
      <path d="M200 150 C 250 150, 250 205, 304 205" stroke={pop} strokeWidth="3" fill="none" />
      {left.map((y) => (
        <rect key={y} x="40" y={y - 18} width="56" height="36" rx="10" fill={soft} stroke={mid} strokeWidth="2" />
      ))}
      <circle cx="200" cy="150" r="10" fill={ink} opacity="0.15" />
      <rect x="304" y="77" width="64" height="36" rx="10" fill={soft} stroke={mid} strokeWidth="2" />
      <rect x="304" y="187" width="64" height="36" rx="10" fill={pop} />
      <path d="M322 205 l8 8 l16 -16" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  );
}
