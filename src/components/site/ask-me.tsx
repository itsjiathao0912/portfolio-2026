"use client";

import { useEffect, useState } from "react";
import { getVisitorRole, isRoleStorageKey, type RoleId } from "@/lib/visitor-role-adapter";
import { startersFor, starterHref } from "./ask-me-data";

/**
 * "Not sure what to say? Start here." Three quiet chips under the email CTA.
 * Static copy, no AI. Each one is a mailto link with the subject prefilled.
 * The role is read after mount (the server cannot know it), so the first paint
 * is the neutral set and nothing shifts: same chip count either way.
 */
export function AskMe({ email }: { email: string }) {
  const [role, setRole] = useState<RoleId | null>(null);
  useEffect(() => {
    const read = () => setRole(getVisitorRole());
    read();
    const onStorage = (e: StorageEvent) => {
      if (isRoleStorageKey(e.key)) read();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const starters = startersFor(role);
  return (
    <div className="flex flex-col items-center gap-3" data-testid="ask-me" data-role={role ?? "none"}>
      <p id="ask-me-title" className="label-mono text-[12px] text-ink-3">
        Not sure what to say? Start here.
      </p>
      <ul aria-labelledby="ask-me-title" className="flex flex-wrap items-center justify-center gap-2">
        {starters.map((s) => (
          <li key={s.id}>
            <a
              href={starterHref(email, s)}
              data-testid="ask-me-chip"
              className="inline-flex min-h-11 items-center rounded-full border border-hairline bg-bg px-4 text-[14px] text-ink-1 transition-colors [@media(hover:hover)]:hover:border-accent [@media(hover:hover)]:hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Ask me {s.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
