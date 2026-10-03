"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { readJSON, writeJSON } from "@/components/signature/participate/logic";
import { usePersona } from "@/components/signature/participate/store";
import { parseStoredDepth, resolveDepth, type Depth } from "./logic";

const KEY = "case-depth";

interface Ctx {
  depth: Depth;
  persona: string | null;
  /** True once the persona store has hydrated (the default depth is then final). */
  ready: boolean;
  setDepth: (depth: Depth) => void;
}

// Outside a provider every section shows (safe default for any other reader of the TOC).
const DEFAULT: Ctx = { depth: "deep", persona: null, ready: true, setDepth: () => {} };
const DepthContext = createContext<Ctx>(DEFAULT);

/**
 * Holds the reading depth for one case-study page. Server render and first paint
 * are "read"; after hydration the depth resolves as: URL hash (#skim, #read, #deep)
 * > the visitor's own choice (if made under the same persona) > the persona default
 * (recruiter skim, engineer deep) > read.
 */
export function ReadingDepthProvider({ children }: { children: ReactNode }) {
  const { persona, ready } = usePersona();
  const [depth, setDepthState] = useState<Depth>("read");
  const chosen = useRef(false);

  useEffect(() => {
    if (!ready) return;
    const apply = () => {
      if (chosen.current) return;
      setDepthState(resolveDepth({ hash: window.location.hash, stored: parseStoredDepth(readJSON<unknown>(KEY, null)), persona }));
    };
    apply();
    const onHash = () => {
      chosen.current = false;
      apply();
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [ready, persona]);

  const setDepth = useCallback(
    (next: Depth) => {
      chosen.current = true;
      setDepthState(next);
      writeJSON(KEY, { depth: next, persona });
    },
    [persona],
  );

  const value = useMemo(() => ({ depth, persona, ready, setDepth }), [depth, persona, ready, setDepth]);
  return <DepthContext.Provider value={value}>{children}</DepthContext.Provider>;
}

export function useReadingDepth() {
  return useContext(DepthContext);
}
