import Image from "next/image";

export interface LogoItem {
  name: string;
  src: string;
  href: string | null;
  height: number;
  width: number;
}

/**
 * Full-bleed black band of white logos (derived from the original files with
 * a CSS filter). Hover: small scale + dim, 200ms. Reduced motion: dim only.
 */
export function LogoStrip({ logos }: { logos: LogoItem[] }) {
  return (
    <div className="bg-black py-10 md:py-[44px]">
      <ul
        className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-center gap-x-10 gap-y-6 px-6 md:justify-between md:gap-x-6"
        data-testid="logo-strip"
      >
        {logos.map((logo) => {
          const img = (
            <Image
              src={logo.src}
              alt={logo.name}
              width={logo.width}
              height={logo.height}
              unoptimized
              className="logo-white h-6 w-auto max-w-[120px] object-contain md:h-8"
            />
          );
          const cls =
            "flex h-12 items-center justify-center transition-[transform,opacity] duration-200 ease-out hover:scale-110 hover:opacity-80 motion-reduce:hover:scale-100";
          return (
            <li key={logo.name}>
              {logo.href ? (
                <a href={logo.href} target="_blank" rel="noopener noreferrer" className={cls} aria-label={`${logo.name} (opens in a new tab)`}>
                  {img}
                </a>
              ) : (
                <div className={cls}>{img}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
