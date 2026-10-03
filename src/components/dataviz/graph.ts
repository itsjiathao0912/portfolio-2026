// Pure graph helper for the explorable diagram (no React), unit-testable.

/** Every node reachable from `id` going downstream, plus every node that reaches it upstream. */
export function connectedTo(id: string, edges: readonly { from: string; to: string }[]) {
  const seen = new Set<string>([id]);
  const walk = (start: string, next: (n: string) => string[]) => {
    const stack = [start];
    while (stack.length) {
      const n = stack.pop()!;
      for (const m of next(n))
        if (!seen.has(m)) {
          seen.add(m);
          stack.push(m);
        }
    }
  };
  walk(id, (n) => edges.filter((e) => e.from === n).map((e) => e.to));
  walk(id, (n) => edges.filter((e) => e.to === n).map((e) => e.from));
  return seen;
}
