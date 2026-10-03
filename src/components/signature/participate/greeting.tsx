"use client";
import { useEffect, useState } from "react";
import { greetingLine, partOfDay, readJSON, writeJSON } from "./logic";
import { usePassport, usePersona } from "./store";

let counted: number | null = null;

const SKY: Record<string, string> = {
  morning: "from-sky-100 to-amber-50", afternoon: "from-sky-200 to-white",
  evening: "from-indigo-200 to-rose-100", night: "from-[#0a1f44] to-indigo-900",
};

/** Time-of-day + returning-visitor line. Renders a fixed-height placeholder until mounted (no shift, no hydration mismatch). */
export function Greeting() {
  const { persona } = usePersona();
  const { collect } = usePassport();
  const [state, setState] = useState<{ hour: number; visits: number } | null>(null);
  useEffect(() => {
    // Count a visit once per page load (StrictMode runs effects twice in dev).
    if (counted === null) {
      counted = readJSON<number>("visits", 0) + 1;
      writeJSON("visits", counted);
    }
    const visits = counted;
    queueMicrotask(() => setState({ hour: new Date().getHours(), visits }));
    if (visits >= 2) collect("greeting");
  }, [collect]);

  const pod = state ? partOfDay(state.hour) : "afternoon";
  const night = pod === "night";
  return (
    <div className={`flex min-h-[56px] items-center gap-3 rounded-full bg-gradient-to-r px-5 py-3 ${SKY[pod]} ${night ? "text-white" : "text-ink-1"}`} aria-live="polite">
      <span aria-hidden className="text-xl">{pod === "morning" ? "🌤️" : pod === "afternoon" ? "☀️" : pod === "evening" ? "🌇" : "🌙"}</span>
      <span className="font-medium">{state ? greetingLine(state.hour, state.visits, persona) : " "}</span>
    </div>
  );
}
