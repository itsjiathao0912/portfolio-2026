import Link from "next/link";
import type { Site } from "@content/schema.ts";

export function SiteFooter({ profile }: { profile: Site["profile"] | null }) {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex flex-col gap-1">
          <p className="font-display text-ink-1">
            {profile?.name ?? "Thao Dao"}{" "}
            <span className="font-sans font-normal text-ink-3" lang="vi">
              · {profile?.nameLocal ?? "Gia Thảo"}
            </span>
          </p>
          <p className="text-sm text-ink-3">{profile ? `${profile.title} · ${profile.location}` : null}</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link href="/work" className="text-ink-2 underline-offset-4 hover:text-accent hover:underline">
            Work
          </Link>
          {profile ? (
            <a href={`mailto:${profile.email}`} className="text-ink-2 underline-offset-4 hover:text-accent hover:underline">
              {profile.email}
            </a>
          ) : null}
          {profile?.socials.map((social) => (
            <a
              key={social.href}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-2 underline-offset-4 hover:text-accent hover:underline"
            >
              {social.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
