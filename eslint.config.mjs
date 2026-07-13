import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Generated OpenNext (Cloudflare) build output:
    ".open-next/**",
    // Wrangler's local build/preview scratch (dev bundles, workerd temp) —
    // huge generated files that otherwise get linted and can OOM eslint.
    ".wrangler/**",
  ]),
]);

export default eslintConfig;
