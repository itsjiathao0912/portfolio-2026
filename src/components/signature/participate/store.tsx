"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { addStamp, isComplete, isPersona, readJSON, sectionOrder, writeJSON, type Persona, type StampId } from "./logic";

type Ctx = {
  persona: Persona | null;
  setPersona: (p: Persona | null) => void;
  order: ReturnType<typeof sectionOrder>;
  stamps: StampId[];
  collect: (id: StampId) => boolean;
  complete: boolean;
  lastStamp: StampId | null;
  ready: boolean;
};

const ParticipateContext = createContext<Ctx | null>(null);

/** Wrap the page once. State lives only in this visitor's localStorage. */
export function ParticipateProvider({ children }: { children: ReactNode }) {
  const [persona, setP] = useState<Persona | null>(null);
  const [stamps, setStamps] = useState<StampId[]>([]);
  const [lastStamp, setLast] = useState<StampId | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Deferred one tick: hydrate from localStorage after the server-matching first paint.
    queueMicrotask(() => {
      const p = readJSON<unknown>("persona", null);
      setP(isPersona(p) ? p : null);
      setStamps(addStamp(readJSON<string[]>("stamps", []), "").stamps);
      setReady(true);
    });
  }, []);

  const setPersona = useCallback((p: Persona | null) => {
    setP(p);
    writeJSON("persona", p);
  }, []);

  const collect = useCallback((id: StampId) => {
    let added = false;
    setStamps((prev) => {
      const r = addStamp(prev, id);
      added = r.added;
      if (r.added) writeJSON("stamps", r.stamps);
      return r.stamps;
    });
    if (added) setLast(id);
    return added;
  }, []);

  const value = useMemo(
    () => ({ persona, setPersona, order: sectionOrder(persona), stamps, collect, complete: isComplete(stamps), lastStamp, ready }),
    [persona, setPersona, stamps, collect, lastStamp, ready],
  );
  return <ParticipateContext.Provider value={value}>{children}</ParticipateContext.Provider>;
}

const NOOP: Ctx = {
  persona: null, setPersona: () => {}, order: sectionOrder(null), stamps: [], collect: () => false,
  complete: false, lastStamp: null, ready: false,
};

/** Safe outside a provider (returns a no-op) so any section can call it. */
export function usePersona() {
  const c = useContext(ParticipateContext) ?? NOOP;
  return { persona: c.persona, setPersona: c.setPersona, order: c.order, ready: c.ready };
}
export function usePassport() {
  const c = useContext(ParticipateContext) ?? NOOP;
  return { stamps: c.stamps, collect: c.collect, complete: c.complete, lastStamp: c.lastStamp };
}

const RM = "(prefers-reduced-motion: reduce)";
function subscribeRM(cb: () => void) {
  const m = window.matchMedia(RM);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
}
export function useReducedMotion() {
  return useSyncExternalStore(subscribeRM, () => window.matchMedia(RM).matches, () => false);
}

/** Mounts children only once scrolled near; reserves `minHeight` so nothing shifts. */
export function LazyMount({ children, minHeight, className }: { children: ReactNode; minHeight: number; className?: string }) {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!el || show) return;
    if (!("IntersectionObserver" in window)) { queueMicrotask(() => setShow(true)); return; }
    const io = new IntersectionObserver((e) => e.some((x) => x.isIntersecting) && setShow(true), { rootMargin: "300px" });
    io.observe(el);
    return () => io.disconnect();
  }, [el, show]);
  return <div ref={setEl} className={className} style={{ minHeight }}>{show ? children : null}</div>;
}
