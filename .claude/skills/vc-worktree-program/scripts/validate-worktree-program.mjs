#!/usr/bin/env node
// D1 validator: a multi-worktree-program run-state.json is well-formed.
//
// Checks:
//   - top-level createdAt + phases object present
//   - every phase has status in the enum, a numeric attempts, and a declared lane
//   - worktree path present once status has advanced past 'queued'
//
// Usage: validate-worktree-program.mjs <run-state.json>
// Exit 0 = valid, 1 = invalid. With no arg, self-tests the bundled fixtures.

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const STATUSES = new Set(["queued", "running", "success", "failed", "blocked", "interrupted"]);

function validate(state) {
  const failures = [];
  if (!state || typeof state !== "object") return ["not an object"];
  if (!state.createdAt) failures.push("missing createdAt");
  if (!state.phases || typeof state.phases !== "object") {
    failures.push("missing phases object");
    return failures;
  }
  const names = Object.keys(state.phases);
  if (names.length === 0) failures.push("phases object is empty");
  for (const [name, rec] of Object.entries(state.phases)) {
    if (!rec || typeof rec !== "object") { failures.push(`${name}: not an object`); continue; }
    if (!STATUSES.has(rec.status)) failures.push(`${name}: invalid status '${rec.status}'`);
    if (typeof rec.attempts !== "number") failures.push(`${name}: attempts must be a number`);
    if (rec.lane === undefined || rec.lane === null || rec.lane === "") {
      failures.push(`${name}: missing lane (each phase must declare its writable lane)`);
    }
    if (rec.status && rec.status !== "queued" && !rec.worktree) {
      failures.push(`${name}: status '${rec.status}' but no worktree path recorded`);
    }
  }
  return failures;
}

const here = dirname(fileURLToPath(import.meta.url));
const arg = process.argv[2];

if (arg) {
  if (!existsSync(arg)) { console.error(`file not found: ${arg}`); process.exit(1); }
  const failures = validate(JSON.parse(readFileSync(arg, "utf8")));
  if (failures.length) { console.error("INVALID:\n  " + failures.join("\n  ")); process.exit(1); }
  console.log("valid run-state");
  process.exit(0);
}

// Self-test against bundled fixtures.
const pass = JSON.parse(readFileSync(join(here, "fixtures", "run-state.pass.json"), "utf8"));
const fail = JSON.parse(readFileSync(join(here, "fixtures", "run-state.fail.json"), "utf8"));
const passFailures = validate(pass);
const failFailures = validate(fail);
let ok = true;
if (passFailures.length) { console.error("PASS fixture rejected:\n  " + passFailures.join("\n  ")); ok = false; }
if (failFailures.length === 0) { console.error("FAIL fixture accepted (should have been rejected)"); ok = false; }
if (!ok) process.exit(1);
console.log(`self-test ok: pass fixture valid, fail fixture caught ${failFailures.length} issue(s)`);
process.exit(0);
