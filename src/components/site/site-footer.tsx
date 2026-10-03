import { Mail } from "lucide-react";
import Link from "next/link";
import type { Site } from "@content/schema.ts";
import { GithubIcon, LinkedinIcon } from "./brand-icons";
import { Magnetic } from "@/components/motion/magnetic";
import { DoodlePad } from "@/components/gems/doodle-pad";
import { SketchHint } from "@/components/gems/sketch-hint";
import { LiquidLink } from "./liquid-link";

function iconFor(label: string) {
  const key = label.toLowerCase();
  if (key.includes("linkedin")) return LinkedinIcon;
  if (key.includes("github")) return GithubIcon;
  return Mail;
}

/**
 * Light footer: a row of round social icons, a big "drop me a line" email
 * CTA (no form — by decision), then a quiet credit line.
 */
export function SiteFooter({ profile }: { profile: Site["profile"] | null }) {
  const socials = profile?.socials ?? [];
  return (
    <footer className="bg-bg" data-testid="site-footer">
      <section
        id="get-in-touch"
        aria-labelledby="footer-title"
        className="mx-auto flex max-w-[832px] flex-col items-center gap-10 px-6 pt-24 pb-20 text-center md:pt-[150px]"
      >
        <ul className="flex items-center gap-4" aria-label="Social links" data-testid="social-icons">
          {socials.map((social) => {
            const Icon = iconFor(social.label);
            return (
              <li key={social.href}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.label} (opens in a new tab)`}
                  className="flex size-12 items-center justify-center rounded-full bg-ink-1 text-bg transition-transform duration-200 [@media(hover:hover)]:hover:scale-110 motion-reduce:hover:scale-100"
                >
                  <Icon className="size-5" aria-hidden="true" />
                </a>
              </li>
            );
          })}
          {profile ? (
            <li>
              <a
                href={`mailto:${profile.email}`}
                aria-label="Email"
                className="flex size-12 items-center justify-center rounded-full bg-ink-1 text-bg transition-transform duration-200 [@media(hover:hover)]:hover:scale-110 motion-reduce:hover:scale-100"
              >
                <Mail className="size-5" aria-hidden="true" />
              </a>
            </li>
          ) : null}
        </ul>
        <h2 id="footer-title" className="text-[28px] leading-[1.2] md:text-[32px]">
          Want to get in touch? Drop me a line.
        </h2>
        {profile ? (
          <Magnetic>
            <LiquidLink href={`mailto:${profile.email}`} data-testid="footer-email" className="h-16 px-10 text-[17px]">
              <Mail className="size-5" aria-hidden="true" />
              {profile.email}
            </LiquidLink>
          </Magnetic>
        ) : null}
        <DoodlePad />
      </section>
      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-8 text-sm text-ink-3 md:flex-row md:items-center md:justify-between">
          <p>
            <span className="inline-flex min-h-11 items-center"><SketchHint name={profile?.name ?? "Thao Dao"} /></span>{" "}
            <span lang="vi">· {profile?.nameLocal ?? "Gia Thảo"}</span>
            {profile ? ` · ${profile.location}` : null}
          </p>
          <nav aria-label="Footer" className="flex gap-2">
            <Link href="/work" className="inline-flex min-h-11 min-w-11 items-center justify-center px-3 hover:text-ink-1">Work</Link>
            <Link href="/about" className="inline-flex min-h-11 min-w-11 items-center justify-center px-3 hover:text-ink-1">About</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
