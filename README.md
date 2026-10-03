# portfolio-2026

Personal portfolio site — Next.js 16 on Cloudflare Workers (OpenNext), D1 for content, R2 for
media, light theme. **Foundation only:** the placeholder home page proves the stack; the real
design comes later.

## Quick start

```bash
pnpm install              # Node 22, pnpm 10.34.5 (pinned); also installs the pre-push hook
pnpm db:seed:local        # create ./local.db and load content/ into it
pnpm dev                  # http://localhost:3000
```

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server (private build dir `.next-dev`, local SQLite) |
| `pnpm typecheck` | App + test type checks |
| `pnpm lint` | ESLint |
| `pnpm test` | Bun unit tests |
| `pnpm test:e2e:isolated` | Production build + Playwright on a private build dir, DB and port (`pnpm test:e2e:install` first) |
| `pnpm build` / `pnpm build:cf` | Next build / Cloudflare Worker build |
| `pnpm db:migrate:local` / `:remote` | Apply `schema/migration.sql` |
| `pnpm db:seed:local` / `:remote` | Sync `content/` into the database |
| `pnpm cf:setup` | Create D1 + R2 on Cloudflare (idempotent; `--dry-run` available) |
| `pnpm secrets:push` | Push allowlisted Worker secrets (`--dry-run` available) |
| `pnpm run deploy:prod` | Deploy `origin/main` from a clean worktree, then smoke the live site |

Production setup and the deploy flow: `process/context/platform/deployment-and-env.md`.
Project knowledge starts at `process/context/all-context.md`.

## Content

Case studies are typed files in `content/projects/`, registered in `content/index.ts`, validated
by `content/schema.ts`, and synced into D1 by the seed. See `process/context/content/all-content.md`.

---

## Agent harness

This repo uses the RIPER-5 agent workflow (see `CLAUDE.md` / `AGENTS.md`). Protocols live in
`process/development-protocols/`.

### 1 Agents

| Agent | Role |
|---|---|
| `vc-code-reviewer` | Comprehensive code review with scout-based edge case detection. |
| `vc-code-simplifier` | Simplifies and refines code for clarity, consistency, and maintainability while preserving all functionality. |
| `vc-debugger` | Use this agent when you need to investigate issues, analyze system behavior, diagnose performance problems, examine database structures, ... |
| `vc-execute-agent` | EXECUTE MODE - Implementing EXACTLY what was planned. |
| `vc-fast-mode-agent` | FAST MODE - Execute compressed RIPER-5 workflow (RESEARCH + SPEC + INNOVATE + PLAN + VALIDATE) in one session, then pause for EXECUTE con... |
| `vc-git-manager` | Stage, commit, and push code changes with conventional commits. |
| `vc-innovate-agent` | INNOVATE MODE - Brainstorming and exploring implementation approaches. |
| `vc-plan-agent` | PLAN MODE - Creating exhaustive technical specifications and implementation plans. |
| `vc-quick-fix-agent` | Quick-fix lane for small low-risk changes. |
| `vc-research-agent` | RESEARCH MODE - Information gathering only. |
| `vc-spec-agent` | SPEC MODE - Product-discovery requirements doc for user review. |
| `vc-tester` | Use this agent when you need to validate code quality through testing, including running unit and integration tests, analyzing test cover... |
| `vc-ui-ux-designer` | Use this agent when the user needs UI/UX execution support including interface implementation, design-system polish, responsive layouts, ... |
| `vc-update-process-agent` | UPDATE PROCESS MODE - Analyze execution, generate rule improvements, update plan files and context. |
| `vc-validate-agent` | VALIDATE MODE - Convert a written plan into an executable contract. |

### 2 Skills

- `mockup-workflow` — Build a single self-contained HTML "workflow mockup" that walks through every screen/state of a page or feature in one file — sticky step...
- `vc-agent-browser` — AI-optimized browser automation CLI with context-efficient snapshots.
- `vc-agent-strategy-compare` — Evaluate 4 execution strategies (sequential, parallel-subagents, workflow, agent-team) for a phase or fan-out task.
- `vc-audit-context` — Audit project context routing, shared-skill discoverability, and Claude/Codex wiring.
- `vc-audit-plans` — Audit active project plan files for staleness, completion, and routing truth.
- `vc-audit-vc` — >-
- `vc-autopilot` — Emit and validate the provisional goal block for Autopilot Mode.
- `vc-autoresearch` — Loop: find gaps → fix → repeat until agents find no gaps or a metric goal is hit.
- `vc-context-discovery` — Discover and load all relevant context for the current task.
- `vc-debug` — Debug systematically with root-cause analysis before fixes.
- `vc-docs-seeker` — Search library/framework documentation via llms.txt (context7.com).
- `vc-feasibility-test` — Use when a SPEC, INNOVATE, or VALIDATE (Layer 2) approach hinges on an unverified runtime/library/external mechanism: run a probe from th...
- `vc-frontend-design` — Create polished frontend interfaces from designs/screenshots/videos.
- `vc-generate-closeout` — Generate the post-EXECUTE closeout packet for a plan or phase.
- `vc-generate-context` — Generate or update the project's authoritative repository context at process/context/all-context.md.
- `vc-generate-phase-program` — Generate kickoff artifacts for a multi-phase program: umbrella plan, Program Goal Charter, session-goal block, per-phase plan stubs, and ...
- `vc-generate-plan` — Create or update implementation plans in the repo's SIMPLE or COMPLEX format.
- `vc-generate-spec` — Create or update a product-discovery SPEC (requirements doc) for user review.
- `vc-intent-clarify` — Clarify intent before RIPER-5 phase delegation.
- `vc-plan-discovery` — Discover related plans for the current task: same feature folder full depth, other features active-only, general-plans active.
- `vc-predict` — 5 expert personas debate proposed changes before implementation.
- `vc-problem-solving` — Apply systematic problem-solving techniques when stuck.
- `vc-publish` — Use when publishing harness improvements to the remote kit repo.
- `vc-qa-tracker` — Maintain a living QA tracker (manual script + automated-test spec + progress log) while the user hand-tests a feature.
- `vc-review-situation` — Use when you need a read-only situation review and handoff summary of current branch state, local/remote refs, worktrees, active project ...
- `vc-risk-evidence-pack` — Define and generate the manual-first evidence pack for high-risk work.
- `vc-scenario` — Generate comprehensive edge cases and test scenarios by decomposing features across 12 dimensions.
- `vc-scout` — Fast codebase scouting using shell search and optional parallel research agents.
- `vc-security` — STRIDE + OWASP-based security audit with optional auto-fix.
- `vc-sequential-thinking` — Apply step-by-step analysis for complex problems with revision capability.
- `vc-setup` — Interactive harness setup for any project.
- `vc-test-coverage-plan` — Use when creating a test plan for a blast radius.
- `vc-update` — Pull latest agent harness improvements from the remote kit repository.
- `vc-validate-findings` — Use when running VALIDATE V2-V3 fan-out.
- `vc-web-testing` — Web testing with Playwright, Vitest, k6.
- `vc-worktree-program` — Use when running 3+ lane-disjoint phases as parallel git-worktree sessions driven from main: persisted run-state, gated per-phase plans, ...
- `vc-worktree-session` — Create and drive ONE isolated git worktree for a single feature/session — own branch off origin/main, own port, own db, own build dir, en...

---

## Maintenance

The two harness tables above must list every agent in `.claude/agents/` and every skill in
`.claude/skills/` (checked by `node .claude/skills/vc-audit-vc/scripts/validate-guide-sync.mjs`).
