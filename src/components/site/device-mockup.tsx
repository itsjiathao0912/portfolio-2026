import Image from "next/image";
import { cn } from "@/lib/utils";

export type DeviceVariant = "laptop" | "phone" | "browser-free";

interface DeviceMockupProps {
  variant: DeviceVariant;
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}

/**
 * An original, CSS-only device frame around a screenshot. No third-party
 * mockup images: the laptop is a dark bezel + base, the phone is a rounded
 * body with a speaker slot, and `browser-free` is a frameless floating screen.
 * The frame is meant to sit at the bottom of a card and run off its edge, so
 * the bottom of each device is deliberately the "heavy" side.
 */
export function DeviceMockup({ variant, src, alt, className, priority, sizes }: DeviceMockupProps) {
  const screen = (
    <Image
      src={src}
      alt={alt}
      fill
      unoptimized
      priority={priority}
      sizes={sizes ?? "(min-width: 1280px) 420px, 90vw"}
      className="object-cover object-top"
      draggable={false}
    />
  );

  if (variant === "phone") {
    return (
      <div data-device="phone" className={cn("relative mx-auto w-[46%] min-w-[150px]", className)}>
        <div className="relative rounded-[2.2rem] bg-[#11141c] p-[6px] shadow-[0_30px_60px_-20px_rgba(11,31,77,0.45)] ring-1 ring-white/10">
          <div className="relative aspect-[9/19] overflow-hidden rounded-[1.8rem] bg-canvas">
            {screen}
            <span aria-hidden="true" className="absolute top-2 left-1/2 h-4 w-14 -translate-x-1/2 rounded-full bg-[#11141c]" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === "browser-free") {
    return (
      <div data-device="browser-free" className={cn("relative w-full", className)}>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[20px] bg-canvas shadow-[0_30px_70px_-24px_rgba(11,31,77,0.45)] ring-1 ring-black/5">
          {screen}
        </div>
      </div>
    );
  }

  return (
    <div data-device="laptop" className={cn("relative w-full", className)}>
      {/* Lid: dark bezel with a tiny camera dot. */}
      <div className="relative mx-[6%] rounded-t-[18px] bg-[#11141c] px-[2.2%] pt-[2.2%] pb-[1.6%] shadow-[0_30px_70px_-24px_rgba(11,31,77,0.5)] ring-1 ring-white/10">
        <span aria-hidden="true" className="absolute top-[0.9%] left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-white/25" />
        <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] bg-canvas">{screen}</div>
      </div>
      {/* Base: thin aluminium deck with a finger notch. */}
      <div aria-hidden="true" className="relative h-3 rounded-b-[14px] bg-gradient-to-b from-[#d9dde6] to-[#aeb4c2] md:h-4">
        <span className="absolute top-0 left-1/2 h-1.5 w-[14%] -translate-x-1/2 rounded-b-md bg-[#9aa1b0]" />
      </div>
    </div>
  );
}
