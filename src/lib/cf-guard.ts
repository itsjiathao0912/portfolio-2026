/**
 * Defense-in-depth guard: make real Cloudflare binding access (production D1 /
 * R2) impossible-by-accident whenever a test/E2E marker is present.
 *
 * Call it at the top of any code path that resolves a real binding.
 */
export function assertCloudflareBindingsAllowed() {
  if (process.env.PORTFOLIO_E2E === "1" || process.env.LOCAL_DB_PATH) {
    throw new Error(
      "Refusing real Cloudflare binding access: a test/E2E marker " +
        "(PORTFOLIO_E2E or LOCAL_DB_PATH) is set. Tests and E2E must use " +
        "disposable local SQLite, never production D1/R2."
    );
  }
}
