---
name: spec:visitor-identity
description: "Locked requirements for the home-page visitor identity system: role picker (replaces Show me first), original clay avatars, walking guide, geo greeting, live role/country stats and a real poll."
date: 04-10-26
metadata: {type: spec, feature: portfolio-site, phase: spec}
---

# Visitor identity: SPEC (locked, input contract for INNOVATE)

**BLUF.** One role choice drives everything on the home page: avatar, project order and note, guide lines, and the live "people like you" stats. Original 2D clay avatars replace DiceBear site-wide. Everything stays minimal, iOS-smooth and dismissible. Research: `visitor-identity_RESEARCH_04-10-26.md` (do not redo).

## Goals
1. Picker replaces "Show me first" (`persona-control.tsx`, `persona-order.ts`) at the top of Selected work. First visit: expanded panel with geo greeting. After a choice: collapses to the visitor's avatar chip; tap to change; persisted in localStorage.
2. Roles (11) + Skip: Recruiter, Founder, Engineer, Product designer, Marketer, Growth, Data, Investor, Student, Fellow PM, Just curious; "Skip / show everything" = no role, default order.
3. Role drives: avatar, project order + view note (extends `orderForPersona`; unlisted slugs keep default order), guide lines, stats framing.
4. Original clay SVG avatar system (soft plasticine shading, role outfit/prop, varied skin tones and hair, poses walk/wave/point/talk). Replaces DiceBear notionists everywhere (one character style).
5. Walking guide, home only: drops in after role choice, walks along top edges of elements tagged `data-guide-walkable`, follows the visitor's scroll, one short role-aware line per section, at most 6 lines total, "Hide character" control, static under reduced motion. Technique reimplemented (not copied) from flowser's interactive-mascot.
6. Geo greeting from Cloudflare `request.cf`: city, else country, else "Hey stranger". Local/test seam.
7. Live stats in D1: per-role and per-country aggregate counters, one count per browser (salted-hash visitor id), no IP stored, polling 10-20 s, rate limited. Playful ranking, e.g. "You're visitor #213; 12 founders, 48 from Vietnam".
8. Poll "What should Thao build next?": real counts only; percentages only after a minimum vote threshold; same infra; unobtrusive.
9. Privacy note, verbatim: "We count roles and countries anonymously. No IP addresses or personal data are stored."

## Key use cases
- First-time visitor on a phone: sees greeting + 12 options, taps "Founder", cards reorder with the existing FLIP glide, panel collapses to chip, guide drops in.
- Returning visitor: chip shows immediately (no panel flash), order restored, no extra stats count.
- Visitor changes role: counters move (old -1, new +1), order/note/guide update.
- Visitor with reduced motion: static avatar, static guide line, no walking.
- Visitor from a VPN / no city: country-only or "Hey stranger", never an error.
- Zero data (fresh deploy): honest zeros ("You're the first Founder from Vietnam"), never fabricated baselines.

## Out of scope
Other pages (/work, /about, case studies), 3D, auth, free-text roles, SSE/Durable Objects, notifications, per-user accounts, remote migration apply and deploy (user-gated), Cloudflare dashboard rate-limit rules (documented only).

## Constraints
- Design rules: `round6/design-consolidation_SPEC.md` (one radius/shadow/spring family, no dark bands on home, canvas count <= 1, no infinite animation beyond marquee/ticker/rotating word/globe, 44 px targets, reduced motion honoured). Motion: `src/components/motion/springs.ts`, `LiftCard` for card hover.
- Raw SQL via `queryAll/queryFirst/execute`; `schema/migration.sql` stays idempotent CREATE IF NOT EXISTS, no semicolon inside a comment.
- Never store or log IP; country comes from `cf` server-side, never from the client; role is an enum.
- Avatar art must be original (no resemblance to existing brands/characters); no third-party packs.
- No fabricated stats; guide lines about Thao come from `content/`-backed facts.
- The concurrent autoresearch loop owns home/work/about files until its round-4 fixes land; lanes touching them wait.

## Acceptance criteria (program level)
| # | Criterion |
|---|---|
| AC1 | First visit shows expanded panel + greeting; choosing collapses to chip; reload restores chip, role, order; "Skip" restores default order |
| AC2 | All 11 roles + skip selectable by mouse and keyboard (radiogroup arrows); each role has avatar, note, guide lines |
| AC3 | `PersonaControl`/"Show me first" no longer rendered; old stored home persona migrates to the new role once |
| AC4 | Greeting: city, else country, else "Hey stranger"; null/garbage `cf` never throws; client cannot spoof country |
| AC5 | One browser counts once; role change moves the counters; no IP/UA stored; hashes salted; rate limit returns 429 |
| AC6 | Stats render real numbers, honest empty state, poll every 10-20 s, paused when tab hidden |
| AC7 | Poll: one vote per browser, changeable, percentages hidden until the threshold, counts real |
| AC8 | Guide: appears only after role choice, home only, <= 6 lines, hide persists, static under reduced motion, never covers a tap target, no layout shift |
| AC9 | Zero DiceBear imports/deps remain; people section uses clay avatars |
| AC10 | Privacy note visible in the panel, exact wording |
| AC11 | Home passes the round-6 QA checklist (no empty viewport, canvas <= 1, no console errors, tokens only) at 1440 and 390 |
