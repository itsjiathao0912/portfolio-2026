// If a client-side navigation has not arrived after a few seconds (RSC request
// killed at the edge, or a click that landed before the app router was ready),
// fall back to a full page load so a nav click never leaves the site frozen.
// Plain inline script, not a client effect: it must be armed before hydration.
// Logic: src/lib/nav-watchdog.ts.
import { NAV_GUARD_SCRIPT } from "@/lib/nav-watchdog";

export function NavWatchdog() {
  return <script dangerouslySetInnerHTML={{ __html: NAV_GUARD_SCRIPT }} />;
}
