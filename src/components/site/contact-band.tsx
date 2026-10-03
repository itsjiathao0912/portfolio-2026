import { ArrowUpRight, Mail } from "lucide-react";
import type { Site } from "@content/schema.ts";
import { DotGrid } from "./dot-grid";
import { LiquidLink } from "./liquid-link";

/** Navy contact band: email + socials (no form — by decision). */
export function ContactBand({ profile }: { profile: Site["profile"] }) {
  return (
    <section
      id="contact"
      aria-labelledby="contact-title"
      className="relative overflow-hidden rounded-[28px] bg-navy px-6 py-16 text-bg md:px-16 md:py-24"
    >
      <DotGrid className="opacity-40" />
      <div className="relative flex flex-col gap-6">
        <p className="label-mono text-accent-tint/80">Contact</p>
        <h2 id="contact-title" className="max-w-3xl text-4xl !text-bg md:text-6xl">
          Hiring for a product role, or want to talk through a delivery problem?
        </h2>
        <p className="max-w-2xl text-lg text-accent-tint">
          Open to product roles and to conversations about delivery, billing systems, or getting regulated products out
          the door.
        </p>
        <div className="mt-2 flex flex-wrap gap-3">
          <LiquidLink href={`mailto:${profile.email}`} variant="inverse" data-testid="contact-email">
            <Mail className="size-4" aria-hidden="true" />
            {profile.email}
          </LiquidLink>
          {profile.socials.map((social) => (
            <LiquidLink key={social.href} href={social.href} variant="inverse" external>
              {social.label}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </LiquidLink>
          ))}
        </div>
      </div>
    </section>
  );
}
