// Salted visitor hash. HMAC-SHA256(VISITOR_SALT, visitorId) as hex. The id and
// the hash are never logged.

import { resolveDbSource } from "./db";

export const MIN_SALT_LENGTH = 16;
const LOCAL_FALLBACK_SALT = "local-dev-visitor-salt-not-a-secret";

export const VISITOR_ID_PATTERN = /^[A-Za-z0-9_-]{8,64}$/;

/** Fail closed: production (non-local DB) with a missing or short salt is not ok. */
export function resolveSalt(env: Record<string, string | undefined>) {
  const salt = env.VISITOR_SALT;
  if (typeof salt === "string" && salt.length >= MIN_SALT_LENGTH) return { ok: true, salt } as const;
  if (resolveDbSource(env) === "local") return { ok: true, salt: LOCAL_FALLBACK_SALT } as const;
  return { ok: false, error: "visitor salt is not configured" } as const;
}

export async function hashVisitor(id: string, salt: string) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", enc.encode(salt), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(id));
  return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}
