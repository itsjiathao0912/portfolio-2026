import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  index?: string;
  eyebrow: string;
  title: string;
  lede?: string;
  id?: string;
  className?: string;
  tone?: "light" | "dark";
}

/** Mono eyebrow ("02 / Experience") + display heading + optional lede. */
export function SectionHeading({ index, eyebrow, title, lede, id, className, tone = "light" }: SectionHeadingProps) {
  const dark = tone === "dark";
  return (
    <div className={cn("flex max-w-3xl flex-col gap-3", className)}>
      <p className={cn("label-mono", dark ? "text-accent-tint/80" : "text-accent")}>
        {index ? `${index} / ` : ""}
        {eyebrow}
      </p>
      <h2 id={id} className={cn("text-3xl md:text-5xl", dark && "!text-bg")}>
        {title}
      </h2>
      {lede ? <p className={cn("text-lg leading-relaxed", dark ? "text-accent-tint" : "text-ink-2")}>{lede}</p> : null}
    </div>
  );
}
