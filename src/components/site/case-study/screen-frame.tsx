import Image from "next/image";
import { cn } from "@/lib/utils";

export type FrameDevice = "laptop" | "phone" | "browser-free" | "browser" | "plain";

/**
 * Original CSS device frames that can hold several stacked screens, so a
 * parent can crossfade between them (`active` = visible layer index).
 */
export function ScreenFrame({
  device,
  screens,
  active = 0,
  className,
  sizes,
  priority,
}: {
  device: FrameDevice;
  screens: { src: string; alt: string }[];
  active?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const layers = screens.map((screen, i) => (
    <Image
      key={screen.src}
      src={screen.src}
      alt={i === active ? screen.alt : ""}
      aria-hidden={i === active ? undefined : true}
      fill
      unoptimized
      priority={priority && i === 0}
      sizes={sizes ?? "(min-width: 1024px) 560px, 90vw"}
      className={cn("object-cover object-top transition-opacity duration-500 ease-out motion-reduce:transition-none", i === active ? "opacity-100" : "opacity-0")}
      draggable={false}
      data-active={i === active ? "true" : undefined}
    />
  ));

  if (device === "phone") {
    return (
      <div data-device="phone" className={cn("relative mx-auto w-full max-w-[290px]", className)}>
        <div className="relative rounded-[2.4rem] bg-[#11141c] p-[7px] shadow-[0_40px_80px_-24px_rgba(11,31,77,0.5)] ring-1 ring-white/10">
          <div className="relative aspect-[9/19.5] overflow-hidden rounded-[2rem] bg-canvas">
            {layers}
            <span aria-hidden="true" className="absolute top-2 left-1/2 h-5 w-16 -translate-x-1/2 rounded-full bg-[#11141c]" />
          </div>
        </div>
      </div>
    );
  }
  if (device === "laptop") {
    return (
      <div data-device="laptop" className={cn("relative w-full", className)}>
        <div className="relative mx-[6%] rounded-t-[18px] bg-[#11141c] px-[2.2%] pt-[2.2%] pb-[1.6%] shadow-[0_40px_80px_-24px_rgba(11,31,77,0.5)] ring-1 ring-white/10">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-canvas">{layers}</div>
        </div>
        <div aria-hidden="true" className="relative h-3 rounded-b-[14px] bg-gradient-to-b from-[#d9dde6] to-[#aeb4c2] md:h-4">
          <span className="absolute top-0 left-1/2 h-1.5 w-[14%] -translate-x-1/2 rounded-b-md bg-[#9aa1b0]" />
        </div>
      </div>
    );
  }
  if (device === "browser") {
    return (
      <div data-device="browser" className={cn("relative w-full overflow-hidden rounded-[18px] bg-bg shadow-[0_30px_70px_-28px_rgba(11,31,77,0.45)] ring-1 ring-black/5", className)}>
        <div aria-hidden="true" className="flex h-7 items-center gap-1.5 border-b border-hairline px-3">
          <span className="size-2.5 rounded-full bg-hairline" />
          <span className="size-2.5 rounded-full bg-hairline" />
          <span className="size-2.5 rounded-full bg-hairline" />
        </div>
        <div className="relative aspect-[16/10]">{layers}</div>
      </div>
    );
  }
  return (
    <div data-device={device} className={cn("relative w-full", className)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-canvas shadow-[0_30px_70px_-24px_rgba(11,31,77,0.45)] ring-1 ring-black/5">{layers}</div>
    </div>
  );
}
