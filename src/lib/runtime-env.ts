/**
 * Read one string config value in whichever runtime we are in.
 *
 * Production: the Cloudflare Worker env (vars + secrets). Everywhere else
 * (`next dev`, `next start`, `bun test`): `process.env`.
 *
 * Always use this — never read `process.env.X` directly for runtime config.
 * On a Worker a secret lives in the binding env, and a dynamic lookup through
 * `process.env` can silently find nothing.
 *
 * The `try` is load-bearing: `getCloudflareContext()` THROWS (it does not
 * return undefined) outside a Worker, so an unguarded call turns "read a config
 * value" into a 500.
 */
export function readRuntimeEnv(key: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports -- lazy: @opennextjs/cloudflare must not load eagerly in dev or under bun test
    const { getCloudflareContext } = require("@opennextjs/cloudflare");
    const env = getCloudflareContext().env as Record<string, unknown>;
    const value = env?.[key];
    if (typeof value === "string" && value) return value;
  } catch {
    // Not on a Worker, or no context bound — fall through.
  }

  const value = typeof process !== "undefined" ? process.env?.[key] : undefined;
  return value || undefined;
}
