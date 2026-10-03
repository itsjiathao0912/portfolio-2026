import type { ProjectVisual as Visual } from "@content/projects/presentation.ts";
import { cn } from "@/lib/utils";
import { DeviceMockup } from "./device-mockup";
import { ProjectIllustration } from "./project-illustration";

interface ProjectVisualProps {
  visual: Visual;
  label: string;
  logo?: string | null;
  tone?: "light" | "deep";
  priority?: boolean;
  /** `card` sizes for the 453 px index card; `hero` for the 800 px case hero. */
  size?: "card" | "hero";
  className?: string;
}

/** The project's cover visual: a device mockup, or an original illustration. */
export function ProjectVisual({ visual, label, logo, tone = "light", priority, size = "card", className }: ProjectVisualProps) {
  if (visual.kind === "illustration") {
    return <ProjectIllustration motif={visual.motif} logo={logo} label={label} tone={tone} className={className} />;
  }
  const sizes = size === "hero" ? "(min-width: 1024px) 760px, 92vw" : "(min-width: 1280px) 400px, 88vw";
  return (
    <div className={cn("relative", className)} data-testid="project-visual">
      <DeviceMockup variant={visual.device} src={visual.screen.src} alt={visual.screen.alt} priority={priority} sizes={sizes} />
      {visual.secondary ? (
        <DeviceMockup
          variant="browser-free"
          src={visual.secondary.src}
          alt={visual.secondary.alt}
          sizes={size === "hero" ? "320px" : "180px"}
          className="absolute right-[-2%] bottom-[8%] w-[42%] rotate-[3deg] md:right-[-4%]"
        />
      ) : null}
    </div>
  );
}
