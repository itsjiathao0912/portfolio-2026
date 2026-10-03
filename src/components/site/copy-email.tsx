"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";

/**
 * Copy-to-clipboard chip that sits beside the mailto button. On success the
 * icon becomes the green "Settled" check and the label reads "Copied" for
 * 1.6 s. The result is announced politely; if the clipboard is blocked the chip
 * says "Copy blocked" and the mailto button still works.
 */
export function CopyEmail({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<number | undefined>(undefined);
  const reduce = useReducedMotion();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(email);
      ok = true;
    } catch {
      ok = false;
    }
    setState(ok ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 1600);
  }

  const copied = state === "copied";
  return (
    <>
      <button
        type="button"
        onClick={copy}
        data-testid="footer-copy"
        data-state={state}
        aria-label={`Copy email address ${email}`}
        className={
          "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-medium " +
          (reduce ? "" : "transition-colors duration-200 ") +
          (copied ? "border-success/30 bg-success/10 text-success" : "border-hairline bg-bg text-ink-1 hover:bg-canvas")
        }
      >
        {copied ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        {copied ? "Copied" : state === "failed" ? "Copy blocked" : "Copy email"}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Email address copied" : state === "failed" ? "Could not copy; use the email button" : ""}
      </span>
    </>
  );
}
