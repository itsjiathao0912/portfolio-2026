import type { NextConfig } from "next";

// Per-run build-dir isolation (inert when NEXT_DIST_DIR is unset).
//
// `scripts/run-isolated-e2e.mjs` sets NEXT_DIST_DIR to a private directory
// (e.g. `.next-e2e-1234`) so its `next build` + `next start` never share a dist
// dir with a running dev server or another build. `pnpm dev` uses `.next-dev`
// for the same reason. Both `next build` and `next start` read distDir from this
// config object, so the build and the server it boots always agree.
//
// Unset (`pnpm build`, `build:cf`/OpenNext) → the key is omitted and Next's
// `.next` default applies. OpenNext expects `.next`, so never set this for
// `build:cf`. Relative, in-tree names only — the runner enforces that too.
const distDir = process.env.NEXT_DIST_DIR;

if (distDir && (distDir.includes("/") || distDir.startsWith(".."))) {
  throw new Error(`NEXT_DIST_DIR must be a plain in-tree directory name, got: ${distDir}`);
}

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  ...(distDir ? { distDir } : {}),
};

export default nextConfig;
