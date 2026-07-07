> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §5 — LOCAL DEV, RUNBOOK, TESTING & DEPLOYMENT (Cloudflare Workers via OpenNext)

This replaces the Vercel-based version of this doc. Hosting target: **Cloudflare Workers**, via the **OpenNext Cloudflare adapter** (`@opennextjs/cloudflare`) — not Cloudflare Pages, not `@cloudflare/next-on-pages`. Re-verify all of this against `https://opennext.js.org/cloudflare` and `https://developers.cloudflare.com/workers/` before relying on it; this stack moves fast and behaviour has changed materially across versions.

## 5.0 Why this adapter, specifically

Cloudflare Pages and `next-on-pages` only support Next's restricted **Edge runtime**, which can't run everything this project needs. `@opennextjs/cloudflare` runs Next on the **Node.js-compatible Workers runtime** instead, which supports the full feature set (Node APIs, the App Router, Server Components, ISR). Concretely: remove any `export const runtime = "edge"` from the codebase — it isn't supported by this adapter and isn't needed.

## 5.1 Environment setup

Node `>= 20.19` as before. Additional installs on top of the original stack:
```bash
npm install -D @opennextjs/cloudflare wrangler
```

`.env.local` stays the same shape as before (Sanity project ID/dataset/tokens). Add a `.dev.vars` file (git-ignored, mirrors `.env.local` for the Workers-runtime preview):
```bash
# .dev.vars — used by `wrangler dev` / opennextjs-cloudflare preview, mirrors .env.local
NEXT_PUBLIC_SANITY_PROJECT_ID="yourProjectId"
NEXT_PUBLIC_SANITY_DATASET="production"
NEXT_PUBLIC_SANITY_API_VERSION="2026-06-01"
SANITY_API_READ_TOKEN=""
SANITY_REVALIDATE_SECRET="a-long-random-string"
```

## 5.2 Project config for the adapter

### `open-next.config.ts` (repo root)
```ts
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doShardedTagCache from "@opennextjs/cloudflare/overrides/tag-cache/do-sharded-tag-cache";

// Start simple (see §5.5 for the decision). This config enables the full
// on-demand revalidation path (R2 cache + Durable Object tag cache).
// If you choose the simpler time-based-only path instead, omit tagCache
// and rely on each fetch's `revalidate: N` instead of revalidateTag/revalidatePath.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  tagCache: doShardedTagCache({ baseShardSize: 12 }),
});
```

### `wrangler.jsonc` (repo root) — only if using the full on-demand path from §5.2
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "compengsoc",
  "compatibility_date": "2026-06-24", // pin to the date you actually deploy; re-verify
  "compatibility_flags": ["nodejs_compat", "global_fetch_strictly_public"],
  "assets": { "directory": ".open-next/assets", "binding": "ASSETS" },
  "services": [{ "binding": "WORKER_SELF_REFERENCE", "service": "compengsoc" }],
  "r2_buckets": [{ "binding": "NEXT_INC_CACHE_R2_BUCKET", "bucket_name": "compengsoc-isr-cache" }],
  "durable_objects": {
    "bindings": [{ "name": "NEXT_TAG_CACHE_DO_SHARDED", "class_name": "DOShardedTagCache" }]
  },
  "migrations": [{ "tag": "v1", "new_sqlite_classes": ["DOShardedTagCache"] }]
}
```
If you go with the simpler time-based-only path (no webhook, no tag cache), you can drop the `durable_objects`/`migrations` blocks for `DOShardedTagCache` and the `tagCache` line in `open-next.config.ts` — but you still need a **queue** (`doQueue`/`DOQueueHandler`). OpenNext's revalidation queue is what actually performs a background re-render when a cached page goes stale; without one configured, Cloudflare's adapter falls back to a "dummy" queue that throws (`FatalError: Dummy queue is not implemented`) the first time a `revalidate: N` page goes stale. The R2 bucket alone does **not** replace it — R2 only stores the cached output, it doesn't trigger regenerating it. Minimal time-based-only config:
```ts
// open-next.config.ts — time-based revalidation, no webhook/tag cache
import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue, // still required even without a tag cache — re-verify this is still the exported path before relying on it
});
```
`wrangler.jsonc` keeps the `r2_buckets` block and a `durable_objects` binding for `DOQueueHandler` only (drop the `DOShardedTagCache` binding and its migration entry).

**A genuinely simpler third option — recommended default for this project:** skip ISR/revalidation entirely. Make the Sanity-backed pages fully static (no `revalidate` on the fetches), and instead have the Sanity webhook trigger a **GitHub Actions rebuild + redeploy** rather than an in-place cache revalidation. This needs zero R2 buckets and zero Durable Objects — just the static-assets cache that ships with the adapter by default. The trade-off is a redeploy (roughly a minute, not instant) before a published change goes live, instead of near-instant ISR. For a society site updated by rotating execs a few times a week, that's a fine trade for not maintaining any Cloudflare storage bindings at all. This is the path we'd suggest starting with; only move to the time-based or on-demand paths above if a minute of staleness ever genuinely matters.

**A free-tier-specific risk worth knowing before you commit to SSR here:** Workers **Free** caps CPU time at **10ms of active compute per request** (separate from wall-clock time — waiting on the Sanity fetch doesn't count, but the React render does). A content-heavy SSR page rendering Portable Text and several Sanity-fetched lists can plausibly bump into that on Free, especially under `npm run preview`'s real Workers runtime rather than `next dev`. If you see `Exceeded CPU Limit` errors in `wrangler tail` or the dashboard, the fix is the **Workers Paid plan ($5/month)**, which raises the default to 30 seconds (configurable up to 5 minutes) — still far cheaper than any other host on this stack, and worth budgeting for as a "if free hits a wall" fallback rather than a blocker to launching on Free first.

### `next.config.ts` additions
```ts
import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // Sanity's own CDN (@sanity/image-url) already resizes/reformats images.
    // Re-optimizing them through Next's image API needs a Cloudflare Images
    // binding we don't otherwise need — skip it and let Sanity's CDN do the work.
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    unoptimized: true,
  },
};

initOpenNextCloudflareForDev(); // gives `next dev` access to local Cloudflare bindings
export default nextConfig;
```

### `package.json` scripts (add alongside the existing ones)
```jsonc
{
  "scripts": {
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy",
    "cf-typegen": "wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts"
  }
}
```

Add `.open-next` to `.gitignore` — it's a build artifact, rebuilt fresh on every deploy.

Add `public/_headers` so static assets cache correctly at the edge:
```
/_next/static/*
  Cache-Control: public,max-age=31536000,immutable
```

## 5.3 Local runbook

```bash
npm run dev        # ordinary next dev — fastest iteration loop, same as before
npm run preview     # builds + runs in the actual Workers runtime locally — use before every deploy
```
`npm run dev` is fine for everyday work (including the canvas/shader/Sanity-mocks loop from before). Run `npm run preview` before trusting anything Workers-specific (bindings, the revalidate route, image handling) — `next dev` doesn't surface Workers-runtime-only bugs.

### Sanity content not appearing / 404s on routes

**Content edited in Studio isn't showing up on localhost:**
1. Make sure you hit **Publish** in the Studio — "Save" only saves a draft. The client uses `perspective: "published"` so drafts are invisible.
2. `sanityFetch` defaults to `revalidate: 60` — changes take up to a minute to appear even after publishing. Wait 60 s then hard-refresh (`Ctrl+Shift+R`), or restart the dev server to flush the cache instantly.

**Routes returning 404 (but files exist on disk):**
The dev server went stale — this happens after a `git pull` or branch switch on Windows where Turbopack's file-watcher misses new route files. Fix:
```powershell
# Ctrl+C to stop the running server, then:
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run dev
```
Sanity itself is almost never the cause. To confirm the backend is healthy before debugging locally:
```powershell
curl.exe "https://ex2of3t7.api.sanity.io/v2021-10-21/data/query/production?query=*%5B0%5D"
# 200 + JSON → backend fine, problem is local. 401/403 → dataset went private. 404 → wrong project ID or dataset name.
```

## 5.4 Hosting, DNS & handover

### 5.4.1 GitHub — unchanged
Same as before: society-owned GitHub org, not a personal account, `main` protected, the `check` script (typecheck + lint) required before merge.

### 5.4.2 Cloudflare account & Worker
1. Create the Cloudflare account under a **society-owned identity** — your Google Workspace gives you exactly this (e.g. `webmaster@compengsoc.org`). Don't use a personal account.
2. `npx wrangler login`, then `npm run deploy` once locally to create the Worker and confirm it builds.
3. Set production secrets (these are Worker secrets, not plain vars — they don't show up in the dashboard in plaintext):
   ```bash
   npx wrangler secret put SANITY_API_READ_TOKEN
   npx wrangler secret put SANITY_REVALIDATE_SECRET
   ```
   Public values (`NEXT_PUBLIC_*`) go in `wrangler.jsonc` under `"vars"` since they're not secret.
4. Connect the GitHub repo for automatic deploys on push (Cloudflare dashboard → Workers & Pages → your Worker → Settings → Build → connect repository), or run `npm run deploy` from CI (GitHub Actions) with a Cloudflare API token as a repo secret — either is fine; pick one and document which in the README.

### 5.4.3 Custom domain
This part is genuinely simpler than the Vercel version:
1. Add `compengsoc.org` as a zone in Cloudflare (Websites → Add a site). Cloudflare scans your existing DNS — **verify your Google Workspace MX and SPF/TXT records came across correctly** before you cut over nameservers, or society email breaks silently.
2. At your registrar, replace the nameservers with the two Cloudflare-assigned ones shown during onboarding.
3. Once the zone is active: Worker → Settings → **Domains & Routes** → Add → Custom Domain → enter `compengsoc.org`. Cloudflare creates the DNS record and issues the certificate automatically — no manual A-record/anycast-IP step. Repeat for `www.compengsoc.org` if you want both, or set up a redirect rule from one to the other (Cloudflare's redirect rules need a proxied placeholder DNS record on the hostname you're redirecting *from* — see Cloudflare's redirect-rules docs if you go this route).
4. Confirm with `dig compengsoc.org +short` and load `https://compengsoc.org/studio` once DNS propagates.

### 5.4.4 Sanity webhook → what it triggers

What the webhook does depends on which option from §5.5 you're running:

- **Default (static + redeploy-on-publish):** the webhook doesn't hit `/api/revalidate` at all — it triggers a **GitHub Actions workflow** (`sanity.io/manage` → API → Webhooks → URL is your repo's `repository_dispatch` or a Cloudflare Deploy Hook URL, not an app route) that runs `npm run deploy`. No `SANITY_REVALIDATE_SECRET`/signature verification needed for this path; the secret-bearing thing is the GitHub Actions trigger token instead, stored as a GitHub repo secret, not a Worker secret.
- **Time-based:** skip the webhook entirely — content updates appear within whatever `revalidate: N` you set on each fetch, no webhook of any kind needed.
- **Full on-demand:** the webhook setup in Sanity (`sanity.io/manage` → API → Webhooks → URL `https://compengsoc.org/api/revalidate`, secret = `SANITY_REVALIDATE_SECRET`) is unchanged from the original Vercel version — the route's *application code* (verify signature → `revalidateTag`/`revalidatePath`) doesn't change between hosts. What changes is purely the infrastructure underneath those calls, which is the R2 + Durable Object setup in §5.2. See the addendum at the end of `docs/reference-implementations.md`.

### 5.4.5 Handover checklist
Same principle as before, Cloudflare-flavoured: transfer the **Cloudflare account**, **GitHub org**, and **Sanity organisation** to society-owned credentials, not personal ones. New tech lead gets Cloudflare account access + Sanity Administrator + GitHub admin; graduating lead is removed. New content execs get Sanity Editor seats as before — none of that changes with the hosting swap.

## 5.5 The decision this doc is making for you (revisit if it stops being right)

Three options, in order of recommendation for this project:

1. **Static + redeploy-on-publish (default — start here).** No `revalidate` on fetches, no R2, no Durable Objects. The Sanity webhook triggers a GitHub Actions rebuild instead of an in-place cache update. Zero Cloudflare storage bindings to configure or maintain; a future tech lead who's never touched Workers can still understand "publishing triggers a rebuild." Cost: roughly a minute of staleness after publishing, not true zero.
2. **Time-based revalidation.** Adds an R2 bucket + a Durable Object queue (no tag cache, no webhook needed). Content goes stale and silently re-renders in the background every `revalidate: N` seconds. Slightly less infrastructure to reason about than full on-demand, but still real infrastructure — pick this only if a 30–60 second staleness window without a rebuild step specifically matters to you.
3. **Full on-demand revalidation (instant updates after publishing).** Adds the R2 bucket, the Durable Object queue, *and* the Durable Object sharded tag cache, wired to the `/api/revalidate` webhook. Most infrastructure, least staleness. For a society site updated by rotating, non-technical execs a few times a week, this is very unlikely to be worth the extra moving parts — default to option 1, and only reach for this if it turns out to matter in practice.
