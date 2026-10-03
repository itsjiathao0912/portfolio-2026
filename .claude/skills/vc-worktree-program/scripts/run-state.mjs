#!/usr/bin/env node
// Persisted run-state for a multi-worktree program (AgentKit adoption #1, made real).
//
// The orchestrator's per-phase status, lane, worktree path, and attempt count must survive
// orchestrator death. This writes run-state.json atomically (temp + rename) before every
// dispatch and on every status transition, so a crashed orchestrator resumes from disk
// instead of JSONL archaeology.
//
// Usage:
//   run-state.mjs init  --dir <runDir> --phases phase-2,phase-3,phase-4 [--lanes "a;b;c"]
//   run-state.mjs set   --dir <runDir> --phase phase-2 --status running
//                       [--worktree <path>] [--lane <str>] [--note <str>]
//   run-state.mjs get   --dir <runDir> [--phase phase-2]
//   run-state.mjs resume-view --dir <runDir>   # running -> interrupted, prints summary
//
// Status enum: queued | running | success | failed | blocked | interrupted

import { writeFileSync, readFileSync, renameSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const STATUSES = new Set(["queued", "running", "success", "failed", "blocked", "interrupted"]);

function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const key = a.slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith("--")) out[key] = true;
      else { out[key] = next; i++; }
    } else out._.push(a);
  }
  return out;
}

function statePath(dir) {
  return join(dir, "run-state.json");
}

function load(dir) {
  const p = statePath(dir);
  if (!existsSync(p)) return null;
  return JSON.parse(readFileSync(p, "utf8"));
}

// Atomic: write to a sibling temp file then rename over the target.
function save(dir, state) {
  mkdirSync(dir, { recursive: true });
  const p = statePath(dir);
  const tmp = `${p}.tmp-${process.pid}`;
  state.updatedAt = new Date().toISOString();
  writeFileSync(tmp, JSON.stringify(state, null, 2) + "\n", "utf8");
  renameSync(tmp, p);
}

function fail(msg) {
  console.error(`run-state: ${msg}`);
  process.exit(1);
}

const args = parseArgs(process.argv.slice(2));
const cmd = args._[0];
const dir = args.dir;
if (!cmd) fail("missing command (init|set|get|resume-view)");
if (!dir) fail("missing --dir <runDir>");

if (cmd === "init") {
  if (!args.phases) fail("init requires --phases phase-a,phase-b,...");
  const phaseNames = String(args.phases).split(",").map((s) => s.trim()).filter(Boolean);
  const lanes = args.lanes ? String(args.lanes).split(";").map((s) => s.trim()) : [];
  const now = new Date().toISOString();
  const phases = {};
  phaseNames.forEach((name, i) => {
    phases[name] = {
      status: "queued",
      lane: lanes[i] || null,
      worktree: null,
      attempts: 0,
      startedAt: null,
      endedAt: null,
      note: null,
    };
  });
  save(dir, { program: args.program || null, createdAt: now, updatedAt: now, phases });
  console.log(`initialized run-state with ${phaseNames.length} phases at ${statePath(dir)}`);
} else if (cmd === "set") {
  const state = load(dir);
  if (!state) fail(`no run-state.json in ${dir} (run init first)`);
  const phase = args.phase;
  if (!phase) fail("set requires --phase");
  const rec = state.phases[phase];
  if (!rec) fail(`unknown phase '${phase}'`);
  if (args.status !== undefined) {
    if (!STATUSES.has(args.status)) fail(`invalid status '${args.status}'`);
    if (args.status === "running" && rec.status !== "running") {
      rec.attempts += 1;
      rec.startedAt = new Date().toISOString();
      rec.endedAt = null;
    }
    if (["success", "failed", "blocked", "interrupted"].includes(args.status)) {
      rec.endedAt = new Date().toISOString();
    }
    rec.status = args.status;
  }
  if (args.worktree !== undefined) rec.worktree = String(args.worktree);
  if (args.lane !== undefined) rec.lane = String(args.lane);
  if (args.note !== undefined) rec.note = String(args.note);
  save(dir, state);
  console.log(`${phase}: status=${rec.status} attempts=${rec.attempts} lane=${rec.lane ?? "-"}`);
} else if (cmd === "get") {
  const state = load(dir);
  if (!state) fail(`no run-state.json in ${dir}`);
  if (args.phase) console.log(JSON.stringify(state.phases[args.phase] ?? null, null, 2));
  else console.log(JSON.stringify(state, null, 2));
} else if (cmd === "resume-view") {
  // On resume: any 'running' phase is now 'interrupted' (its process is gone). Re-verify on disk.
  const state = load(dir);
  if (!state) fail(`no run-state.json in ${dir}`);
  let converted = 0;
  for (const [name, rec] of Object.entries(state.phases)) {
    if (rec.status === "running") {
      rec.status = "interrupted";
      rec.endedAt = new Date().toISOString();
      rec.note = (rec.note ? rec.note + "; " : "") + "auto: running->interrupted on resume";
      converted += 1;
    }
  }
  if (converted) save(dir, state);
  const summary = Object.entries(state.phases).map(
    ([name, r]) => `  ${name}: ${r.status} (attempts ${r.attempts}, lane ${r.lane ?? "-"})`,
  );
  console.log(`resume-view: ${converted} running->interrupted\n${summary.join("\n")}`);
  console.log("\nRe-verify each non-terminal phase against disk before redispatch.");
} else {
  fail(`unknown command '${cmd}'`);
}
