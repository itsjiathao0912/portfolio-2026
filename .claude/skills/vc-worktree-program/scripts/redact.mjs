#!/usr/bin/env node
// Redaction gate (AgentKit adoption #3, made real).
//
// `.worktreeinclude` ships `.env` / `.env.test.*` into every worktree, and the orchestrator
// tails JSONL transcripts and reports diffs each tick — a direct credential path into status
// reports. Every transcript tail and every diff MUST pass through this BEFORE it reaches a
// report. Rules enforced here:
//   - redact before write; never print a raw value "for debugging"
//   - never emit the hash, length, or first/last N chars — [REDACTED:<category>] is opaque
//   - report only a count on stderr: "N redactions applied."
//   - if the INVOCATION string itself carries a credential, REFUSE (exit 2) so the user sees it
//
// Usage:
//   <command> | node redact.mjs            # scrub stdin -> stdout, count on stderr
//   node redact.mjs --file <path>          # scrub a file to stdout
//   node redact.mjs --strict ...           # exit 3 if any redaction was applied (pre-write assert)

import { readFileSync } from "node:fs";

// Ordered most-specific-first so a secret is labeled by its true category.
const PATTERNS = [
  ["env-credential-line", /^[A-Z][A-Z0-9_]*(?:PASSWORD|SECRET|TOKEN|KEY|CREDENTIAL|PASSWD|API|AUTH|SESSION)[A-Z0-9_]*=.+$/gm],
  ["private-key-block", /-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----[\s\S]*?-----END (?:[A-Z ]+ )?PRIVATE KEY-----/g],
  ["db-url-credential", /\b(?:postgres|postgresql|mysql|mongodb(?:\+srv)?|redis|amqp):\/\/[^:\s/@]+:[^@\s/]+@\S+/gi],
  ["basic-auth-url", /\bhttps?:\/\/[^:\s/@]+:[^@\s/]+@\S+/gi],
  ["jwt", /\beyJ[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}\.[A-Za-z0-9_-]{6,}/g],
  ["bearer-token", /\bBearer\s+[A-Za-z0-9._~+/-]{12,}=*/g],
  ["aws-access-key-id", /\bAKIA[0-9A-Z]{16}\b/g],
  ["github-token", /\bgh[pousr]_[A-Za-z0-9]{20,}/g],
  ["slack-token", /\bxox[baprs]-[A-Za-z0-9-]{10,}/g],
  ["stripe-key", /\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{10,}/g],
  ["provider-secret-key", /\bsk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}/g],
  ["generic-secret-assignment", /\b(?:api[_-]?key|secret|token|password|passwd|credential)\b\s*[:=]\s*["']?[A-Za-z0-9._\-+/]{8,}["']?/gi],
  ["rfc1918-ip", /\b(?:10\.(?:\d{1,3}\.){2}\d{1,3}|172\.(?:1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}|192\.168\.\d{1,3}\.\d{1,3})\b/g],
];

function redact(text) {
  let count = 0;
  let out = text;
  for (const [category, re] of PATTERNS) {
    out = out.replace(re, () => {
      count += 1;
      return `[REDACTED:${category}]`;
    });
  }
  return { out, count };
}

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

const args = parseArgs(process.argv.slice(2));

// Refuse if the invocation string itself carries a credential (user must see the refusal).
const invocation = process.argv.slice(2).filter((a) => a !== "--strict" && a !== "--file").join(" ");
if (invocation && redact(invocation).count > 0) {
  console.error("redact: REFUSED — the invocation string contains a credential-like value. Pipe content via stdin or --file; never put secrets on the command line.");
  process.exit(2);
}

function run(text) {
  const { out, count } = redact(text);
  process.stdout.write(out);
  console.error(`${count} redactions applied.`);
  if (args.strict && count > 0) process.exit(3);
  process.exit(0);
}

if (args.file) {
  run(readFileSync(String(args.file), "utf8"));
} else {
  const chunks = [];
  process.stdin.on("data", (c) => chunks.push(c));
  process.stdin.on("end", () => run(Buffer.concat(chunks).toString("utf8")));
  process.stdin.resume();
}
