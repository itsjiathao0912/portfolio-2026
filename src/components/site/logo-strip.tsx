import Image from "next/image";

export interface LogoItem {
  name: string;
  src: string;
  href: string | null;
  /** Rendered height in px; wide wordmarks need less than square icons. */
  height: number;
  width: number;
}

/**
 * Company / product logos. Hover-capable devices: greyscale at rest, full
 * colour + small lift on hover. Touch devices show colour at rest and only
 * pulse while pressed, so nothing stays stuck after a tap. Reduced motion:
 * colour change only.
 */
export function LogoStrip({ logos }: { logos: LogoItem[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5" data-testid="logo-strip">
      {logos.map((logo) => {
        const img = (
          <Image
            src={logo.src}
            alt={logo.name}
            width={logo.width}
            height={logo.height}
            unoptimized
            className="h-auto max-h-9 w-auto max-w-[70%] object-contain"
          />
        );
        const tile =
          "group flex h-24 items-center justify-center rounded-[var(--radius)] border border-hairline bg-bg transition-[transform,box-shadow,filter] duration-200 ease-out active:scale-95 " +
          "[@media(hover:hover)]:grayscale [@media(hover:hover)]:opacity-75 hover:-translate-y-1 hover:rotate-[-1deg] hover:shadow-card-hover [@media(hover:hover)]:hover:grayscale-0 [@media(hover:hover)]:hover:opacity-100 " +
          "motion-reduce:hover:translate-y-0 motion-reduce:hover:rotate-0";
        return (
          <li key={logo.name}>
            {logo.href ? (
              <a href={logo.href} target="_blank" rel="noopener noreferrer" className={tile} aria-label={`${logo.name} (opens in a new tab)`}>
                {img}
              </a>
            ) : (
              <div className={tile}>{img}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
