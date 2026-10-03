# E2E lane recipe

For automated lanes that build tests from the tracker's scenarios.

1. **One worktree + one branch per lane.** Rebase/merge onto the tip sha before each run; the report must name the commit tested.
2. **Wire the new Playwright project and prove it runs:** put the spec path BEFORE any `--project` flags, then check the run prints `N tests` (a trailing positional is parsed as a project name and silently runs zero tests). Confirm with `--list`.
3. **Take the machine locks** the repo defines for heavy / real-media runs (see `process/context/tests/all-tests.md`; this repo defines no locks yet — run heavy suites one at a time), one suite at a time, and record machine load at start and end.
4. **Run detached** with a per-spec log file; the lane returns a handle to watch instead of blocking on a long gate.
5. **Real UI flows.** Real clicks, per-step screenshots; build from "what breaks in the first 5 minutes of manual testing". A `unit-only` check is a gap, not coverage.
6. **Up to 3 rounds per test.** Classify each failure: test bug / product bug / known gap, with `file:line`. Consistent and specific failure is a product bug, not flakiness.
7. **Report from Playwright's own line** ("N passed / 0 failed") taken from the log body, not a driver exit line. Write `rc=$?` on its own line before echoing it. A spec counts as passing only on 0 failed.
8. **Mutation check** each new test: commit first; mutate through the path that reproduced the bug; confirm RED; restore from a copy (`cp`), never `git checkout <file>`; never mutate in a worktree a dev server serves; report "N mutations, each red; survivors: <reason>" (a survivor is a missing test).
9. **Name the manual-only gaps** in the report, each with its reason, and end with a numbered device checklist plus a separate "not verified on a real device" list.
10. **Coverage matrix (read-only agent, optional):** columns `Spec: path:line | lane | real-UI | unit-only | last result | GAP | closest proxy for non-automatable`. Unit-only = GAP.
