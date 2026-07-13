// assert-deploy-env.mjs — predeploy gate (npm auto-runs it before `deploy`).
// `next build` loads .env.local OVER .env.production, so a local deploy with
// NEXT_PUBLIC_USE_MOCKS=true would silently ship mock content. @next/env ships
// with next (zero new deps) and reproduces the exact build-time env resolution.
import nextEnv from "@next/env"; // CJS module — no named ESM exports

const { combinedEnv } = nextEnv.loadEnvConfig(process.cwd(), false);
const problems = [];

if (combinedEnv.NEXT_PUBLIC_USE_MOCKS === "true") {
  problems.push(
    'NEXT_PUBLIC_USE_MOCKS="true" — production must build live content. Set it to false (or unset it) in .env.local, then re-run.',
  );
}
if (!combinedEnv.NEXT_PUBLIC_SITE_URL?.startsWith("https://")) {
  problems.push(
    "NEXT_PUBLIC_SITE_URL must be the canonical https origin — metadataBase, OG URLs, sitemap and robots all derive from it.",
  );
}

if (problems.length > 0) {
  console.error("deploy blocked:\n" + problems.map((p) => `  x ${p}`).join("\n"));
  process.exit(1);
}
console.log("deploy env OK — live content, canonical site URL");
