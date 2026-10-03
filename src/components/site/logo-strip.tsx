import Image from "next/image";

export interface LogoItem {
  name: string;
  src: string;
  href: string | null;
  height: number;
  width: number;
  /** The file is a white-only wordmark: render it dark on the light band. */
  whiteOnly?: boolean;
}

function Track({ logos, copy }: { logos: LogoItem[]; copy: boolean }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-16 pr-16 md:gap-24 md:pr-24"
      aria-hidden={copy ? true : undefined}
      data-testid={copy ? undefined : "logo-strip"}
    >
      {logos.map((logo) => {
        const img = (
          <Image
            src={logo.src}
            alt={copy ? "" : logo.name}
            width={logo.width}
            height={logo.height}
            unoptimized
            className={`h-7 w-auto max-w-[150px] object-contain md:h-9 ${logo.whiteOnly ? "logo-dark" : ""}`}
          />
        );
        const cls =
          "flex h-14 items-center justify-center transition-transform duration-200 ease-out [@media(hover:hover)]:hover:scale-110 motion-reduce:hover:scale-100";
        return (
          <li key={logo.name}>
            {logo.href ? (
              <a
                href={logo.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cls}
                tabIndex={copy ? -1 : undefined}
                aria-label={copy ? undefined : `${logo.name} (opens in a new tab)`}
              >
                {img}
              </a>
            ) : (
              <div className={cls}>{img}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Full-bleed light band with the original full-colour logos drifting in an
 * infinite marquee (CSS only: two identical tracks shifted by -50%). Hover or
 * keyboard focus pauses it. Reduced motion: a static row. The duplicate track
 * is hidden from assistive tech and the tab order.
 */
export function LogoStrip({ logos }: { logos: LogoItem[] }) {
  // Repeat short lists so one track is always wider than the viewport.
  const filled = logos.length >= 6 ? logos : [...logos, ...logos.map((l) => ({ ...l, name: `${l.name} ` }))];
  const first = logos;
  const rest = filled.slice(logos.length);
  return (
    <div className="marquee group relative overflow-hidden border-y border-hairline bg-bg py-7 md:py-[36px]">
      <div style={{ maskImage: "linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)" }}>
      <div className="marquee-track flex w-max">
        <div className="flex">
          <Track logos={first} copy={false} />
          <Track logos={rest} copy />
        </div>
        <div className="flex" aria-hidden="true">
          <Track logos={first} copy />
          <Track logos={rest} copy />
        </div>
      </div>
      </div>
    </div>
  );
}
