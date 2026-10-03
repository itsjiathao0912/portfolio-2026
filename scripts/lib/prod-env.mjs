import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import dotenv from "dotenv";
import { findMissingEnv, PROD_ENV_FILE } from "./deploy-guards.mjs";

/**
 * Load the production credential file into process.env (override: true, so a
 * stale shell export can never win over the file). Exits the process with a
 * clear message on any problem. Never prints a value.
 *
 * @param {{ required?: string[] }} [options]
 */
export function loadProdEnvOrExit({ required = ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"] } = {}) {
  if (!existsSync(PROD_ENV_FILE)) {
    console.error(`Missing ${PROD_ENV_FILE}. Copy ${PROD_ENV_FILE}.example to ${PROD_ENV_FILE} and fill it in.`);
    process.exit(1);
  }
  const result = dotenv.config({ path: PROD_ENV_FILE, override: true, quiet: true });
  if (result.error) {
    console.error(`Failed to load ${PROD_ENV_FILE}: ${result.error.message}`);
    process.exit(1);
  }
  const missing = findMissingEnv(process.env, required);
  if (missing.length > 0) {
    console.error(`Missing required values in ${PROD_ENV_FILE}: ${missing.join(", ")}`);
    process.exit(1);
  }
}

/** Run a command with inherited stdio; exit on failure. */
export function runOrExit(label, command, args, options = {}) {
  console.log(`\n=== ${label} ===`);
  const step = spawnSync(command, args, { env: process.env, stdio: "inherit", ...options });
  if (step.status !== 0) {
    console.error(`\n${label} failed (exit ${step.status ?? "signal"}).`);
    process.exit(step.status ?? 1);
  }
}

/** Run a command and capture its output. Never throws. */
export function capture(command, args, options = {}) {
  const result = spawnSync(command, args, { env: process.env, encoding: "utf8", ...options });
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

/** The D1 database name used by every script (matches wrangler.jsonc). */
export const D1_DATABASE_NAME = "portfolio-db";
/** The R2 bucket name (matches wrangler.jsonc). */
export const R2_BUCKET_NAME = "portfolio-media";
/** The Worker name (matches wrangler.jsonc). */
export const WORKER_NAME = "portfolio-2026";
