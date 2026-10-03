---
name: context:all-content
description: "Content group entrypoint — the Project/case-study schema, content blocks, authoring in content/, and seeding into D1"
keywords: content, project, projects, case, study, studies, schema, blocks, seed, seeding, authoring, cms
related: [context:deployment-and-env, context:all-uxui]
date: 03-10-26
metadata:
  read_when: "adding or editing case studies, changing the content schema, or seeding the database"
---

# all-content.md

## Model

**Source of truth = typed files in `content/`.** The database is a synced copy.

- `content/schema.ts` — zod schema (`projectInputSchema`) and `parseProjects()` (validates every
  entry and checks unique `id`/`slug`).
- `content/projects/*.ts` — one file per project, `export default {...} satisfies ProjectInput`.
- `content/index.ts` — the registry array (`projectEntries`). A new file must be added here.

Project fields: `id`, `slug` (kebab-case, unique), `title`, `summary`, `role`, `period`, `year`,
`category`, `tags[]`, `cover`, `blocks[]`, `links[]`, `sortOrder`, `published`, `updatedAt`
(ISO datetime). Display order is `sortOrder`, then title. Only `published: true` entries show.

Content blocks (ordered, typed): `heading` (level 2|3), `paragraph`, `image` (src, alt, caption),
`quote` (attribution), `list` (ordered). Add a new block type in `contentBlockSchema` first,
then its renderer.

## Database

`schema/migration.sql` → table `"Project"` (JSON columns `tags`, `blocks`, `links` stored as
text; `published` as 0/1). Mapping both ways is `src/lib/project-rows.ts`; reads are
`src/lib/projects.ts` (corrupt rows are skipped and reported, never thrown).

## Seeding

- `pnpm db:seed:local` → `./local.db` (or `LOCAL_DB_PATH`); `pnpm db:seed:remote` → production D1.
- The seed **syncs**: it upserts every entry and **deletes rows whose id is no longer in
  `content/`**. Removing a file from `content/` and seeding removes it from the site.
- Invalid content aborts the seed before anything is written.
- `scripts/seed.mjs` imports `content/*.ts` directly (Node 22 type stripping), so files under
  `content/` and `src/lib/project-rows.ts` must use relative `.ts` imports and erasable-only TS.

## Media

Images will live in R2 (binding `MEDIA`). No upload or serving route exists yet — it is part of
the site build-out.
