// Request guards for the visitor POST routes. Result objects, no throws.

import type { ZodType } from "zod";

export const MAX_BODY_BYTES = 512;

export type GuardFail = { ok: false; status: 400 | 403 | 413; error: string };

/** Origin host must equal Host. A missing Origin is refused. */
export function checkOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return { ok: false, status: 403, error: "origin required" } as const;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return { ok: false, status: 403, error: "bad origin" } as const;
  }
  const host = req.headers.get("host") ?? new URL(req.url).host;
  return originHost === host ? ({ ok: true } as const) : ({ ok: false, status: 403, error: "bad origin" } as const);
}

/** JSON content-type, Content-Length precheck, then a stream read capped at 512 B. */
export async function readJsonBody<T>(req: Request, schema: ZodType<T>) {
  const type = (req.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return { ok: false, status: 400, error: "json required" } as const;

  const declared = req.headers.get("content-length");
  if (declared !== null && Number(declared) > MAX_BODY_BYTES) {
    return { ok: false, status: 413, error: "body too large" } as const;
  }

  const chunks: Uint8Array[] = [];
  let size = 0;
  if (req.body) {
    const reader = req.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => undefined);
        return { ok: false, status: 413, error: "body too large" } as const;
      }
      chunks.push(value);
    }
  }
  const bytes = new Uint8Array(size);
  let at = 0;
  for (const c of chunks) {
    bytes.set(c, at);
    at += c.byteLength;
  }

  let json: unknown;
  try {
    json = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return { ok: false, status: 400, error: "invalid json" } as const;
  }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return { ok: false, status: 400, error: "invalid body" } as const;
  return { ok: true, data: parsed.data } as const;
}
