import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Scripts and tests may use `any`; product source keeps it at error level.
  {
    files: ["scripts/**", "tests/**"],
    rules: { "@typescript-eslint/no-explicit-any": "warn" },
  },
  globalIgnores([
    ".next/**",
    ".next-*/**",
    ".open-next/**",
    ".wrangler/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    ".claude/**",
    ".codex/**",
    ".agents/**",
    "process/**",
    "playwright/**",
    "playwright-report/**",
    "test-results/**",
  ]),
]);

export default eslintConfig;
