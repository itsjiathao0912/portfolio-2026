"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { connectedTo } from "./graph";
import { VizFigure, type VizFrameProps } from "./viz-figure";

type Kind = "step" | "actor" | "guard" | "outcome";
interface Node {
  id: string;
  label: string;
  detail: string;
  col: number;
  row: number;
  kind: Kind;
}
interface ExplorableProps extends VizFrameProps {
  nodes: Node[];
  edges: { from: string; to: string; dashed: boolean }[];
  quorum?: { nodes: string[]; need: number; unlocks: string[]; prompt: string };
}

const CELL_W = 210;
const CELL_H = 92;
const NODE_W = 178;
const NODE_H = 62;

const KIND_FILL: Record<Kind, string> = { step: "#ffffff", actor: "#eaf1ff", guard: "#fff3c7", outcome: "#daf5e8" };

/** Split a label into ≤2 lines of ~22 chars for the SVG view. */
function lines(label: string) {
  if (label.length <= 22) return [label];
  const words = label.split(" ");
  let a = "";
  while (words.length && (a + " " + words[0]).trim().length <= 22) a = (a + " " + words.shift()).trim();
  return [a, words.join(" ")];
}

/**
 * Explorable diagram. Click (or tab + Enter) a node: its upstream and
 * downstream path lights up and its note opens below. With a `quorum`, the
 * quorum nodes are approvals to collect; `unlocks` stay locked until enough
 * are collected (e.g. a 2-of-3 multisig).
 */
export function Explorable({ nodes, edges, quorum, ...frame }: ExplorableProps) {
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<string | null>(null);
  const [approved, setApproved] = useState<string[]>([]);
  const cols = Math.max(...nodes.map((n) => n.col)) + 1;
  const rows = Math.max(...nodes.map((n) => n.row)) + 1;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const lit = selected ? connectedTo(selected, edges) : null;
  const unlocked = !quorum || approved.length >= quorum.need;
  const locked = (id: string) => !!quorum && !unlocked && quorum.unlocks.includes(id);
  const on = (id: string) => (!lit || lit.has(id)) && !locked(id);
  const current = selected ? byId.get(selected) : null;
  // Nodes reached only by dashed (learning) edges get their own group on phones.
  const learning = new Set(
    nodes
      .filter((n) => {
        const incident = edges.filter((e) => e.from === n.id || e.to === n.id);
        return incident.length > 0 && incident.every((e) => e.dashed);
      })
      .map((n) => n.id),
  );

  const press = (id: string) => {
    if (quorum?.nodes.includes(id)) setApproved((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));
    setSelected((s) => (s === id && !quorum?.nodes.includes(id) ? null : id));
  };

  const cx = (n: Node) => n.col * CELL_W + CELL_W / 2;
  const cy = (n: Node) => n.row * CELL_H + CELL_H / 2;

  const button = (n: Node, extra?: string) => {
    const isApproved = approved.includes(n.id);
    return (
      <button
        key={n.id}
        type="button"
        onClick={() => press(n.id)}
        aria-pressed={quorum?.nodes.includes(n.id) ? isApproved : selected === n.id}
        aria-disabled={locked(n.id)}
        className={cn(
          "flex min-h-12 w-full items-center justify-between gap-2 rounded-md border px-3.5 py-2 text-left text-sm font-semibold text-ink-1 transition-all",
          selected === n.id ? "border-ink-1 ring-2 ring-ink-1" : "border-hairline",
          !on(n.id) && "opacity-35",
          extra,
        )}
        style={{ background: isApproved ? "#dbeafe" : KIND_FILL[n.kind] }}
        data-testid="explorable-node"
        data-node={n.id}
      >
        <span>{n.label}</span>
        {quorum?.nodes.includes(n.id) ? <span className="text-xs text-accent">{isApproved ? "Approved ✓" : "Tap to approve"}</span> : null}
        {locked(n.id) ? <span className="text-xs text-ink-3">Locked</span> : null}
      </button>
    );
  };

  return (
    <VizFigure kind="explorable" {...frame}>
      <div className="flex flex-col gap-5">
        {quorum ? (
          <p className="flex flex-wrap items-center gap-2 text-sm text-ink-2" aria-live="polite" data-testid="quorum-status">
            {quorum.prompt}
            <span className={cn("rounded-full px-3 py-0.5 font-semibold tabular-nums", unlocked ? "bg-success text-white" : "bg-bg text-ink-1")}>
              {Math.min(approved.length, quorum.nodes.length)} of {quorum.nodes.length} · need {quorum.need}
            </span>
          </p>
        ) : null}

        {/* Desktop: SVG graph with HTML-free text so the diagram scales as one piece. */}
        <div className="hidden overflow-x-auto md:block">
          <svg viewBox={`0 0 ${cols * CELL_W} ${rows * CELL_H}`} className="w-full" role="group" aria-label={frame.title}>
            <defs>
              <marker id="xp-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
              </marker>
            </defs>
            {edges.map((e) => {
              const a = byId.get(e.from)!;
              const b = byId.get(e.to)!;
              const sameCol = a.col === b.col;
              const dir = b.col >= a.col ? 1 : -1;
              const x1 = sameCol ? cx(a) : cx(a) + (dir * NODE_W) / 2;
              const y1 = sameCol ? cy(a) + (b.row > a.row ? NODE_H / 2 : -NODE_H / 2) : cy(a);
              const x2 = sameCol ? cx(b) : cx(b) - dir * (NODE_W / 2 + 3);
              const y2 = sameCol ? cy(b) - (b.row > a.row ? NODE_H / 2 + 3 : -NODE_H / 2 - 3) : cy(b);
              const mid = (x1 + x2) / 2;
              const d = sameCol ? `M${x1},${y1} L${x2},${y2}` : `M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}`;
              const active = on(e.from) && on(e.to) && (!lit || (lit.has(e.from) && lit.has(e.to)));
              return (
                <motion.path
                  key={`${e.from}-${e.to}`}
                  d={d}
                  fill="none"
                  strokeWidth={active && lit ? 2.5 : 1.6}
                  strokeDasharray={e.dashed ? "6 6" : undefined}
                  markerEnd="url(#xp-arrow)"
                  className={active ? (lit ? "text-accent" : "text-ink-3") : "text-hairline"}
                  stroke="currentColor"
                  initial={e.dashed ? { opacity: reduce ? 1 : 0 } : { pathLength: reduce ? 1 : 0 }}
                  whileInView={e.dashed ? { opacity: 1 } : { pathLength: 1 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: reduce ? 0 : 0.8, ease: "easeOut" }}
                />
              );
            })}
            {nodes.map((n) => {
              const text = lines(n.label);
              const isApproved = approved.includes(n.id);
              return (
                <g
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`${n.label}${locked(n.id) ? " (locked)" : ""}`}
                  aria-pressed={quorum?.nodes.includes(n.id) ? isApproved : selected === n.id}
                  onClick={() => press(n.id)}
                  onKeyDown={(ev) => {
                    if (ev.key === "Enter" || ev.key === " ") {
                      ev.preventDefault();
                      press(n.id);
                    }
                  }}
                  className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-accent"
                  style={{ opacity: on(n.id) ? 1 : 0.35, transition: "opacity 200ms" }}
                  data-testid="explorable-svg-node"
                >
                  <rect
                    x={cx(n) - NODE_W / 2}
                    y={cy(n) - NODE_H / 2}
                    width={NODE_W}
                    height={NODE_H}
                    rx={14}
                    fill={isApproved ? "#dbeafe" : KIND_FILL[n.kind]}
                    stroke={selected === n.id ? "#0b1220" : "#d8dde6"}
                    strokeWidth={selected === n.id ? 2.5 : 1.2}
                    strokeDasharray={locked(n.id) ? "5 4" : undefined}
                  />
                  {text.map((t, i) => (
                    <text key={i} x={cx(n)} y={cy(n) + (i - (text.length - 1) / 2) * 17 + 5} textAnchor="middle" className="fill-ink-1 text-[14px] font-semibold">
                      {t}
                    </text>
                  ))}
                  {quorum?.nodes.includes(n.id) ? (
                    <text x={cx(n) + NODE_W / 2 - 12} y={cy(n) - NODE_H / 2 + 16} textAnchor="end" className="fill-accent text-[11px] font-semibold">
                      {isApproved ? "✓" : "approve"}
                    </text>
                  ) : null}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Phone: the same nodes as stacked columns, readable at 390 px. */}
        <ol className="flex flex-col gap-2 md:hidden">
          {Array.from({ length: cols }, (_, c) => nodes.filter((n) => n.col === c && !learning.has(n.id)).sort((a, b) => a.row - b.row))
            .filter((group) => group.length > 0)
            .map((group, c) => (
              <li key={group[0].id} className="flex flex-col gap-2">
                {c > 0 ? (
                  <span aria-hidden="true" className="self-center text-ink-3">
                    ↓
                  </span>
                ) : null}
                {group.map((n) => button(n))}
              </li>
            ))}
          {learning.size > 0 ? (
            <li className="mt-3 flex flex-col gap-2 rounded-2xl border border-dashed border-border-strong p-3">
              <span className="text-xs font-semibold tracking-wide text-ink-3 uppercase">Learning loop</span>
              {nodes.filter((n) => learning.has(n.id)).map((n) => button(n))}
            </li>
          ) : null}
        </ol>

        <div className="min-h-[5.5rem] rounded-2xl bg-bg p-5" aria-live="polite" data-testid="explorable-note">
          {current ? (
            <>
              <p className="font-semibold text-ink-1">{current.label}</p>
              <p className="mt-1 text-[0.95rem] leading-relaxed text-ink-2">{locked(current.id) ? `Locked until ${quorum?.need} approvals are collected.` : current.detail}</p>
            </>
          ) : (
            <p className="text-[0.95rem] text-ink-3">Tap a step to follow its path and read what happens there.</p>
          )}
        </div>
      </div>
    </VizFigure>
  );
}
