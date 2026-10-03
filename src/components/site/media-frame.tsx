import Image from "next/image";
import { cn } from "@/lib/utils";

interface MediaFrameProps {
  src: string | null;
  alt: string;
  /** Shown inside the placeholder when there is no image yet. */
  label: string;
  device?: "browser" | "plain";
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * A screenshot inside a light browser frame. With no `src` it renders a
 * designed placeholder (frame + dot pattern + label) instead of a broken or
 * grey image, and marks itself with data-placeholder for tests.
 */
export function MediaFrame({ src, alt, label, device = "browser", className, priority, sizes }: MediaFrameProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[14px] border border-hairline bg-bg shadow-[0_24px_48px_-24px_rgba(11,31,77,0.35)]",
        className
      )}
    >
      {device === "browser" ? (
        <div className="flex h-7 items-center gap-1.5 border-b border-hairline bg-canvas px-3" aria-hidden="true">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
      ) : null}
      {src ? (
        <div className="relative aspect-[16/10] w-full bg-canvas">
          <Image
            src={src}
            alt={alt}
            fill
            unoptimized
            priority={priority}
            sizes={sizes ?? "(min-width: 1024px) 760px, 100vw"}
            className="object-cover object-top"
          />
        </div>
      ) : (
        <div
          role="img"
          aria-label={alt}
          data-placeholder=""
          className="relative flex aspect-[16/10] w-full items-center justify-center bg-canvas bg-[radial-gradient(var(--border-strong)_1px,transparent_1px)] [background-size:18px_18px]"
        >
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-bg/90 px-6 py-4 text-center shadow-card">
            <span className="font-display text-lg text-ink-1">{label}</span>
            <span className="label-mono text-ink-3">Screens coming soon</span>
          </div>
        </div>
      )}
    </div>
  );
}
