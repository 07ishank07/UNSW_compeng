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
3. **No Worker secrets are needed on the shipped path.** The site does published/public reads only (`useCdn: true`, `perspective: "published"` — no token), and there is no `/api/revalidate` route (option 1, §5.5). The commands below are for the FUTURE paths only — a draft-preview mode or on-demand ISR:
   ```bash
   npx wrangler secret put SANITY_API_READ_TOKEN     # only if draft preview is ever built
   npx wrangler secret put SANITY_REVALIDATE_SECRET  # only if option 3 (on-demand ISR) is adopted
   ```
   Public values (`NEXT_PUBLIC_*`) go in `wrangler.jsonc` under `"vars"` since they're not secret (already committed there).
4. **Decision (2026-07): CI is `.github/workflows/deploy.yml`** (GitHub Actions — push to `main`, Sanity `repository_dispatch`, daily cron, manual trigger), not the dashboard build-connect. It needs `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` as GitHub repo secrets — see §5.6.

### 5.4.3 Custom domain
This part is genuinely simpler than the Vercel version:
1. Add `compengsoc.org` as a zone in Cloudflare (Websites → Add a site). Cloudflare scans your existing DNS — **verify your Google Workspace MX and SPF/TXT records came across correctly** before you cut over nameservers, or society email breaks silently.
2. At your registrar, replace the nameservers with the two Cloudflare-assigned ones shown during onboarding.
3. Once the zone is active: Worker → Settings → **Domains & Routes** → Add → Custom Domain → enter `compengsoc.org`. Cloudflare creates the DNS record and issues the certificate automatically — no manual A-record/anycast-IP step. Repeat for `www.compengsoc.org` if you want both, or set up a redirect rule from one to the other (Cloudflare's redirect rules need a proxied placeholder DNS record on the hostname you're redirecting *from* — see Cloudflare's redirect-rules docs if you go this route).
4. Confirm with `dig compengsoc.org +short` and load `https://compengsoc.org/studio` once DNS propagates.

### 5.4.4 Sanity webhook → what it triggers

What the webhook does depends on which option from §5.5 you're running:

- **Default (static + redeploy-on-publish — SHIPPED):** the webhook doesn't hit `/api/revalidate` at all — it POSTs a **`repository_dispatch`** (event type `sanity-publish`) to the GitHub API, which runs `.github/workflows/deploy.yml`. No `SANITY_REVALIDATE_SECRET`/signature verification needed for this path; the secret-bearing thing is the fine-grained GitHub PAT inside the webhook's `Authorization` header. Exact webhook config in §5.6 step 6.
- **Time-based:** skip the webhook entirely — content updates appear within whatever `revalidate: N` you set on each fetch, no webhook of any kind needed.
- **Full on-demand:** the webhook setup in Sanity (`sanity.io/manage` → API → Webhooks → URL `https://compengsoc.org/api/revalidate`, secret = `SANITY_REVALIDATE_SECRET`) is unchanged from the original Vercel version — the route's *application code* (verify signature → `revalidateTag`/`revalidatePath`) doesn't change between hosts. What changes is purely the infrastructure underneath those calls, which is the R2 + Durable Object setup in §5.2. See the addendum at the end of `docs/reference-implementations.md`.

### 5.4.5 Handover checklist
Same principle as before, Cloudflare-flavoured: transfer the **Cloudflare account**, **GitHub org**, and **Sanity organisation** to society-owned credentials, not personal ones. New tech lead gets Cloudflare account access + Sanity Administrator + GitHub admin; graduating lead is removed. New content execs get Sanity Editor seats as before — none of that changes with the hosting swap.

## 5.5 The decision this doc is making for you (revisit if it stops being right)

Three options, in order of recommendation for this project:

1. **Static + redeploy-on-publish (default — start here).** No `revalidate` on fetches, no R2, no Durable Objects. The Sanity webhook triggers a GitHub Actions rebuild instead of an in-place cache update. Zero Cloudflare storage bindings to configure or maintain; a future tech lead who's never touched Workers can still understand "publishing triggers a rebuild." Cost: roughly a minute of staleness after publishing, not true zero.
2. **Time-based revalidation.** Adds an R2 bucket + a Durable Object queue (no tag cache, no webhook needed). Content goes stale and silently re-renders in the background every `revalidate: N` seconds. Slightly less infrastructure to reason about than full on-demand, but still real infrastructure — pick this only if a 30–60 second staleness window without a rebuild step specifically matters to you.
3. **Full on-demand revalidation (instant updates after publishing).** Adds the R2 bucket, the Durable Object queue, *and* the Durable Object sharded tag cache, wired to the `/api/revalidate` webhook. Most infrastructure, least staleness. For a society site updated by rotating, non-technical execs a few times a week, this is very unlikely to be worth the extra moving parts — default to option 1, and only reach for this if it turns out to matter in practice.

## 5.6 Launch runbook (2026-07, as built — free tier, custom domain)

The repo side is done: `wrangler.jsonc` carries the public `vars`, `.github/workflows/deploy.yml` deploys on push / Sanity publish / daily cron / manual trigger, `npm run deploy` is guarded by `scripts/assert-deploy-env.mjs` (blocks a build with `NEXT_PUBLIC_USE_MOCKS=true` or a non-https `NEXT_PUBLIC_SITE_URL`), and live builds prerender every event/blog detail page (static assets are free and unmetered on Workers; the Worker itself only runs for unknown-slug fallbacks and the `/studio` shell). What remains is account wiring — do these IN ORDER:

> **State as of 2026-07 (verified by DNS lookup):** `compengsoc.org` is **already an active Cloudflare zone** (nameservers `ace`/`adel.ns.cloudflare.com`) with **working Google Workspace email** (`MX → smtp.google.com`, `google-site-verification` TXT present) and **no apex A record yet**. So the zone-add + nameserver-cutover + email-migration steps are already done — skip them. The Worker must be deployed **into the same Cloudflare account that holds this zone**, or the Custom Domain can't attach.

0. **Credentials — use a scoped token, NOT the Global API Key.** The Cloudflare **Global API Key** grants full, account-wide access (DNS, billing, every zone) and must never go in CI secrets or a config file. Two safe credentials replace it:
   - **Local:** `npx wrangler login` (browser OAuth) — no key needed at all.
   - **CI:** a **scoped API token** — dashboard → My Profile → API Tokens → Create Token → **"Edit Cloudflare Workers"** template → set *Account Resources* to the account holding `compengsoc.org`. That token is the only Cloudflare credential GitHub needs.
   If the account was shared with you, make sure you're an actual **member** of it (so `wrangler login` and the token see the right account); don't operate via someone else's Global API Key.
1. **Repo state.** Merge this work to `main` (don't push until step 3's secrets exist, or accept one red Actions run). `npm run check` must be green.
2. **First deploy (local).** Confirm you can see `compengsoc.org` in the target account's dashboard, then:
   ```powershell
   npx wrangler login          # pick the account that owns compengsoc.org
   # temporarily flip .env.local: NEXT_PUBLIC_USE_MOCKS=false, NEXT_PUBLIC_SITE_URL=https://compengsoc.org
   npm run deploy              # predeploy guard verifies env, then builds + creates the Worker
   ```
   Note the `https://compengsoc.<account>.workers.dev` URL and the gzip worker size `wrangler` prints (must stay < 3 MiB on free). Flip `.env.local` back to mocks for everyday dev.
3. **GitHub Actions secrets.** Repo → Settings → Secrets and variables → Actions:
   - `CLOUDFLARE_API_TOKEN` — the scoped token from step 0 (**not** the Global API Key).
   - `CLOUDFLARE_ACCOUNT_ID` — dashboard → Workers & Pages → the account holding the zone; the ID is in the right rail (and in the dashboard URL). Must be the same account you deployed into in step 2.
   Then run the `deploy` workflow by hand (Actions → deploy → Run workflow) and confirm it goes green.
4. **Attach the custom domain.** The zone already exists, so this is one screen: Worker → Settings → Domains & Routes → Add → **Custom Domain** → `compengsoc.org` (repeat for `www`, or add a redirect rule). Cloudflare creates a **proxied record for the apex and issues the cert automatically** — this is a *different record type* from the `MX`, so **email is untouched** as long as you don't delete the existing `MX` / `google-site-verification` / SPF records in the DNS tab. Verify with `Resolve-DnsName compengsoc.org` (an apex record now appears) and load `https://compengsoc.org/studio`.
5. **Sanity CORS.** `sanity.io/manage` → project `ex2of3t7` → API → CORS origins: add `https://compengsoc.org` (+ `https://www.compengsoc.org` if used) and the `workers.dev` URL from step 2, **with credentials allowed** (the embedded Studio authenticates from the browser). `http://localhost:3000` should already be there for local dev.
6. **Sanity webhook → GitHub rebuild.** `sanity.io/manage` → project → API → Webhooks → Create:
   - **URL:** `https://api.github.com/repos/07ishank07/UNSW_compeng/dispatches` (update owner/repo after the org handover)
   - **Dataset:** `production` · **Trigger on:** create, update, delete
   - **Filter:** `_type in ["event","sponsor","execMember","post","academicResource","siteSettings"]`
   - **Projection:** `{"event_type": "sanity-publish"}`
   - **HTTP method:** POST · **HTTP headers:**
     - `Content-Type: application/json`
     - `Accept: application/vnd.github+json`
     - `X-GitHub-Api-Version: 2022-11-28`
     - `Authorization: Bearer <fine-grained PAT>` — create at GitHub → Settings → Developer settings → Fine-grained tokens; scope it to THIS repo only with **Contents: Read and write**; set the longest expiry and put the rotation date in the handover calendar.
   - **Test:** publish any trivial edit in Studio → an Actions run appears within seconds → change is live in ~1–2 minutes.
7. **Editors.** Invite exec as Sanity project members (Editor role — 3 seats on the free plan, §3.8 of the schema doc). They edit at `https://compengsoc.org/studio`; hitting **Publish** is what triggers the rebuild.
8. **Free-tier limits — what we actually consume.** (Re-verify numbers against Cloudflare's docs at launch.)

   | Workers Free limit | Value | This site's exposure |
   |---|---|---|
   | Requests | 100k/day | Static asset hits are **free and unmetered**; the Worker only runs for non-prerendered paths (unknown slugs, `/studio` shell) — trivial volume |
   | CPU time | 10 ms/request | Site is fully static (every page prerendered at build); if `Exceeded CPU Limit` ever shows in `wrangler tail` → Workers Paid $5/mo raises it to 30 s |
   | Worker size | 3 MiB gzip | Server bundle only (Studio JS ships as client-side static assets); read the size `npm run deploy` prints — Paid raises to 10 MiB if ever needed |
   | GitHub Actions | free (public repo unmetered; 2 000 min/mo private) | ~3–5 min per deploy; daily cron + a few publishes/week sits far inside |
   | Sanity free plan | 3 seats, generous API/CDN quota | published reads go through Sanity's CDN; builds query a handful of times per day |

   The **daily cron** in `deploy.yml` (00:00 AEST) is not optional polish: the site is fully static, so the upcoming/past event split is frozen at build time — the nightly rebuild is what moves yesterday's event out of "Upcoming" without waiting for someone to publish.
9. **Handover.** Transfer the Cloudflare account, GitHub org, and Sanity organisation to society-owned credentials (§5.4.5), hand over the PAT rotation date, and point the new tech lead at this section.
