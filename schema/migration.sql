-- Source of truth for the database schema.
--
-- MUST stay idempotent (CREATE ... IF NOT EXISTS only): it is applied on every
-- local DB open (src/lib/local-db.ts), by the unit-test helper, and by
-- `pnpm db:migrate:local|remote`. A future column change needs its own
-- migration file plus this file's CREATE block updated in the same change.
--
-- Rule: never put a semicolon inside a comment in this file. Remote tooling
-- splits statements on that character.

CREATE TABLE IF NOT EXISTS "Project" (
  "id"        TEXT PRIMARY KEY NOT NULL,
  "slug"      TEXT NOT NULL,
  "title"     TEXT NOT NULL,
  "summary"   TEXT NOT NULL DEFAULT '',
  "role"      TEXT NOT NULL DEFAULT '',
  "period"    TEXT NOT NULL DEFAULT '',
  "year"      INTEGER,
  "category"  TEXT NOT NULL DEFAULT '',
  "tags"      TEXT NOT NULL DEFAULT '[]',
  "cover"     TEXT,
  "blocks"    TEXT NOT NULL DEFAULT '[]',
  "links"     TEXT NOT NULL DEFAULT '[]',
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "published" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "Project_slug_key" ON "Project" ("slug");
CREATE INDEX IF NOT EXISTS "Project_published_sortOrder_idx" ON "Project" ("published", "sortOrder");

-- Presentation fields for a project (company, tint, proof numbers, logo).
-- A separate table rather than new Project columns, so this file stays a pure
-- CREATE IF NOT EXISTS script that is safe on an existing database.
CREATE TABLE IF NOT EXISTS "ProjectMeta" (
  "projectId" TEXT PRIMARY KEY NOT NULL,
  "data"      TEXT NOT NULL DEFAULT '{}',
  "updatedAt" TEXT NOT NULL
);

-- Site-wide content (profile, experience, education, certifications, awards,
-- skills). One row per item, grouped by collection, JSON body in data.
CREATE TABLE IF NOT EXISTS "ContentEntry" (
  "id"         TEXT PRIMARY KEY NOT NULL,
  "collection" TEXT NOT NULL,
  "sortOrder"  INTEGER NOT NULL DEFAULT 0,
  "data"       TEXT NOT NULL,
  "updatedAt"  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS "ContentEntry_collection_sortOrder_idx" ON "ContentEntry" ("collection", "sortOrder");
