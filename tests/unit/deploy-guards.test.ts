import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  checkDeployableGitState,
  checkHealthResponse,
  checkLiveProjectCount,
  findBakedLocalDbPath,
  findLocalDbPathSources,
  findMissingEnv,
  partitionSecrets,
  setD1DatabaseId,
} from "../../scripts/lib/deploy-guards.mjs";

describe("LOCAL_DB_PATH guards", () => {
  test("pre-build: reports every truthy source, ignores blanks", () => {
    expect(
      findLocalDbPathSources({ LOCAL_DB_PATH: "/x.db" }, [
        { file: "a", value: "" },
        { file: "b", value: "local.db" },
        { file: "c", value: undefined },
      ])
    ).toEqual([
      { source: "process.env", value: "/x.db" },
      { source: "b", value: "local.db" },
    ]);
    expect(findLocalDbPathSources({}, [])).toEqual([]);
  });

  test("post-build: detects a baked value in the OpenNext env snapshot", () => {
    expect(findBakedLocalDbPath(`export const production = {"NODE_ENV":"production"};`)).toEqual([]);
    expect(findBakedLocalDbPath(`export const production = {"LOCAL_DB_PATH":"local.db"};`)).toEqual(["local.db"]);
    expect(findBakedLocalDbPath(`{"LOCAL_DB_PATH":""}`)).toEqual([]);
    expect(findBakedLocalDbPath("")).toEqual([]);
  });
});

describe("post-deploy smoke verdict", () => {
  test("only real data passes", () => {
    expect(checkHealthResponse(200, `{"ok":true,"projects":3}`)).toEqual({ ok: true, projects: 3 });
    expect(checkHealthResponse(500, `{"ok":false}`).ok).toBe(false);
    expect(checkHealthResponse(200, `<html>`).ok).toBe(false);
    expect(checkHealthResponse(200, `{"ok":false,"error":"database unavailable"}`).ok).toBe(false);
    expect(checkHealthResponse(200, `{"ok":true}`).ok).toBe(false);
  });
});

describe("deploy git preflight", () => {
  const sha = "a".repeat(40);
  test("passes only a clean tree at origin/main", () => {
    expect(checkDeployableGitState({ headSha: sha, originSha: sha, porcelain: "" })).toEqual({ ok: true, sha });
    expect(checkDeployableGitState({ headSha: sha, originSha: sha, porcelain: " M x.ts\n" }).ok).toBe(false);
    expect(checkDeployableGitState({ headSha: sha, originSha: "b".repeat(40), porcelain: "" }).ok).toBe(false);
    expect(checkDeployableGitState({ headSha: sha, originSha: null, porcelain: "" }).ok).toBe(false);
  });
});

describe("cf:setup wrangler.jsonc edit", () => {
  const wrangler = readFileSync(path.join(process.cwd(), "wrangler.jsonc"), "utf8");

  test("rewrites only the matching database_id", () => {
    const updated = setD1DatabaseId(wrangler, "portfolio-db", "1234-abcd");
    expect(updated).not.toBeNull();
    expect(updated).toContain(`"database_id": "1234-abcd"`);
    expect(updated?.replace(`"database_id": "1234-abcd"`, "")).toBe(
      wrangler.replace(/"database_id": "[^"]*"/, "")
    );
  });

  test("refuses when the named database is absent", () => {
    expect(setD1DatabaseId(wrangler, "other-db", "x")).toBeNull();
  });
});

describe("misc", () => {
  test("findMissingEnv treats blank as missing", () => {
    expect(findMissingEnv({ A: "1", B: "" }, ["A", "B", "C"])).toEqual(["B", "C"]);
  });

  test("partitionSecrets reports names only", () => {
    expect(partitionSecrets({ A: "secret", B: "" }, ["A", "B"])).toEqual({ present: ["A"], absent: ["B"] });
  });
});

describe("live project count guard", () => {
  test("passes only when D1 matches content/", () => {
    expect(checkLiveProjectCount(9, 9).ok).toBe(true);
    const short = checkLiveProjectCount(3, 9);
    expect(short.ok).toBe(false);
    expect(!short.ok && short.error).toContain("3");
  });
});

describe("deploy-prod re-seeds remote D1 before going live", () => {
  test("seed --remote runs from the worktree before wrangler deploy", () => {
    const src = readFileSync(path.join(process.cwd(), "scripts", "deploy-prod.mjs"), "utf8");
    const seedAt = src.indexOf('["scripts/seed.mjs", "--remote"], inWorktree');
    const deployAt = src.indexOf('["wrangler", "deploy"], inWorktree');
    expect(seedAt).toBeGreaterThan(0);
    expect(deployAt).toBeGreaterThan(seedAt);
    expect(src).toContain("checkLiveProjectCount(verdict.projects, expectedProjects)");
  });
});
