> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §5 — LOCAL DEV, RUNBOOK, TESTING & DEPLOYMENT

## 5.1 Environment setup

**Node:** `>= 20.19` (Sanity v4+ floor and Next 16 minimum). Node 24 (Active LTS) recommended. Use `nvm`:
```bash
nvm install 24 && nvm use 24
node -v   # confirm >= 20.19
corepack enable   # so pnpm/yarn "just work" if used; npm is fine too
```

**`.env.local`** (repo root, git-ignored). Public values are safe in the browser; the read/write tokens and revalidate secret are **server-only**.
```bash
# --- Public (safe to expose; needed by the embedded Studio + client) ---
NEXT_PUBLIC_SANITY_PROJECT_ID="yourProjectId"     # from sanity.io/manage
NEXT_PUBLIC_SANITY_DATASET="production"            # or "development" while building
NEXT_PUBLIC_SANITY_API_VERSION="2026-06-01"        # calendar-pinned query behaviour

# --- Server-only (NEVER prefixed NEXT_PUBLIC; never imported into 'use client') ---
SANITY_API_READ_TOKEN=""                            # Viewer token, only if doing draft/preview reads
SANITY_API_WRITE_TOKEN=""                           # Editor/write token, ONLY for scripts/seed.ts (remove from prod env)
SANITY_REVALIDATE_SECRET="a-long-random-string"     # shared secret for the /api/revalidate webhook
```

**`.env.example`** mirrors the above with placeholder values and **is committed**. Keep it byte-for-byte in sync with the variable names the code reads (a missing var must throw at boot via `env.ts`, never fail silently).

**Install:**
```bash
npm install
# core: next@latest react@latest react-dom@latest
# sanity: sanity@latest next-sanity@latest @sanity/vision @sanity/image-url @portabletext/react @sanity/webhook
# motion: gsap @gsap/react lenis
# 3d: three @react-three/fiber @react-three/drei @react-three/postprocessing
# style: tailwindcss @tailwindcss/postcss
# safety/tooling: zod  (dev) typescript @types/three @types/react @types/react-dom eslint eslint-config-next prettier
```

**First-time Sanity project creation** (if the project doesn't exist yet):
```bash
npx sanity@latest login            # authenticate
npx sanity@latest init --env        # create/select project + dataset; writes IDs to .env (copy into .env.local)
# Then in sanity.io/manage -> API:
#   - add CORS origins: http://localhost:3000  and  https://<your-domain>  (allow credentials)
#   - create tokens: a Viewer (read) token, and a Write token only if seeding
```

## 5.2 Local runbook — frontend + Studio together

The Studio is **embedded** in the Next app at `/studio`, so a single dev server runs both. There is no separate Studio process to start.
```bash
npm run dev
# Next.js (Turbopack) on http://localhost:3000
#   - public site:     http://localhost:3000
#   - Sanity Studio:   http://localhost:3000/studio   (log in with your Sanity account)
#   - GROQ playground: http://localhost:3000/studio + the Vision tool tab
```

Recommended `package.json` scripts:
```jsonc
{
  "scripts": {
    "dev": "next dev",                 // Turbopack is the Next 16 default; no flag needed
    "build": "next build",             // also Turbopack by default
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "typegen": "next typegen",         // generates PageProps<'/route'> helpers for async params
    "seed": "tsx scripts/seed.ts",     // populate a dev dataset from data/mocks/*
    "check": "npm run typecheck && npm run lint"   // run before every commit/PR
  }
}
```
> If a build fails because of a legacy webpack-only config you don't have, that's expected — Next 16 builds with Turbopack by default. Only fall back to `next build --webpack` if you knowingly depend on a webpack plugin.

## 5.3 Mocking sandbox — develop the heavy canvas offline

The masterpiece layer must be developable with **no network and no Sanity client**. Achieve this with a single switch and shape-accurate mocks.

1. **Mocks mirror the GROQ result shapes** exactly (`data/mocks/*` ↔ §3.7 query selections). Type them with the same `types/sanity.ts` types so a drift is a compile error.

2. **A source switch in the fetch layer.** Add an env flag and branch in a thin data-access module the pages call (not in `sanity/lib/fetch.ts` itself, which stays pure):
   ```ts
   // src/lib/content.ts — the pages import from here, not directly from sanity/lib/fetch.
   import "server-only";
   import { sanityFetch } from "@/sanity/lib/fetch";
   import * as mocks from "@/data/mocks";
   import { upcomingEventsQuery /* ... */ } from "@/sanity/lib/queries";

   const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

   export async function getUpcomingEvents() {
     if (USE_MOCKS) return mocks.events.filter((e) => new Date(e.startDateTime) >= new Date());
     return sanityFetch({ query: upcomingEventsQuery, tags: ["event"] });
   }
   // ...one thin function per view, same pattern.
   ```
   Set `NEXT_PUBLIC_USE_MOCKS=true` in `.env.local` to build/tune the entire site (and the canvas) with zero network. Flip to `false` to hit live Sanity. Because the switch lives in one module, no page or component knows or cares which source is active.

3. **Canvas-only harness.** While tuning the shader, run the hero on a route or Storybook-style page fed purely by mocks so a flaky network never blocks GPU iteration. The shader reads colours from `lib/design-tokens.ts` (not the network), so it renders identically online or offline.

4. **Optional seed instead of mocks.** `npm run seed` pushes `data/mocks/*` into a `development` dataset via the write token, giving you a *real* Sanity playground without touching `production`. Use a separate dataset name in `.env.local` while developing.

## 5.4 Testing

This is a content/visual site, so testing is targeted, not exhaustive:
- **Type + lint gate:** `npm run check` must pass (zero TS errors, zero ESLint errors) before any commit. This catches the most common real bug here — a query/field/schema drift.
- **Boundary validation:** parse every fetched payload with a Zod schema (or rely on generated types) at the page boundary; a malformed document renders the designed empty/error state, never a crash (§2.4).
- **Lighthouse (mobile, throttled)** on `/`, `/events`, `/sponsors`: meet the §2.6 thresholds. Re-run after adding the canvas/motion layers — they are the usual regression source.
- **Manual a11y pass:** tab through every page (visible focus everywhere), test with reduced-motion enabled (no animation runs), test with JS-heavy canvas disabled (site still works), test 360px width (no overflow; timeline stacks).
- **WebGL fallback test:** disable WebGL in the browser (or force a context loss) and confirm the static poster + usable page appear (§2.2).

## 5.5 Hosting, DNS & handover

### 5.5.1 GitHub
```bash
git init && git add -A && git commit -m "feat: CompEngSoc site scaffold"
git branch -M main
git remote add origin git@github.com:compengsoc/website.git
git push -u origin main
# Use the society GitHub org (not a personal account) so handover survives graduations.
# Protect main; require the `check` script to pass in CI before merge.
```

### 5.5.2 Vercel (frontend + embedded Studio, one deploy)
1. Import the GitHub repo in Vercel → it auto-detects Next.js.
2. **Environment variables** (Project → Settings → Environment Variables) — add every var from `.env.local` for **Production** (and Preview): the `NEXT_PUBLIC_SANITY_*` trio, `SANITY_API_READ_TOKEN` (if used), and `SANITY_REVALIDATE_SECRET`. **Do not** add `SANITY_API_WRITE_TOKEN` to production (it's only for the local seed script). Do **not** set `NEXT_PUBLIC_USE_MOCKS` in production (or set it `false`).
3. Deploy. The site is live at `https://<project>.vercel.app`, and the Studio at `https://<project>.vercel.app/studio`.
4. In `sanity.io/manage` → API → **CORS origins**, add the Vercel URL **and** the custom domain (below), with credentials allowed, so the production Studio can authenticate.

### 5.5.3 On-demand revalidation webhook (so publishing updates the live site instantly)
1. In `sanity.io/manage` → API → **Webhooks** → Create:
   - **URL:** `https://<your-domain>/api/revalidate`
   - **Trigger on:** create / update / delete
   - **Filter (optional):** `_type in ["event","sponsor","execMember","post","academicResource","siteSettings"]`
   - **Secret:** the same value as `SANITY_REVALIDATE_SECRET`
   - **Projection:** `{ _type, "slug": slug.current }`
2. The route (`src/app/api/revalidate/route.ts`, §A.4) verifies the signature and calls `revalidateTag(_type)` / `revalidatePath(...)`. Now an editor's "Publish" reflects on the live site within seconds — **no redeploy** (§2.4).

### 5.5.4 Map the production build to the custom `.org` domain
The society's domain (e.g. `compengsoc.org`) is an **apex** domain → use an **A record** (a CNAME at the apex is invalid per DNS rules). Vercel shows the exact records under **Project → Settings → Domains**; the values below are Vercel's general-purpose anycast values — **always confirm against what your dashboard / `vercel domains inspect` reports for your project.**

1. Vercel → Project → Settings → **Domains** → **Add** → enter `compengsoc.org` (apex, no `www`, no `https://`). Vercel will also offer to add `www` for a redirect — accept it (pick one canonical; `www → apex` or `apex → www`).
2. At the **registrar's DNS panel**, add:
   - **Apex (A):** Host `@` → Value `76.76.21.21` → TTL `3600`/Auto
   - **www (CNAME):** Host `www` → Value `cname.vercel-dns.com` (or the project-specific value Vercel shows) → TTL `3600`/Auto
   - **Delete any conflicting/auto-created records** on `@` or `www` (e.g. a registrar auto-A on `www`); two records on one host cause intermittent failures.
3. **If DNS is behind Cloudflare:** set both records to **"DNS only" (grey cloud)** — proxied (orange-cloud) breaks Vercel's SSL provisioning handshake.
4. **Alternative (full delegation):** point the registrar's nameservers to `ns1.vercel-dns.com` / `ns2.vercel-dns.com` and manage all DNS in Vercel. Required if you ever use wildcard subdomains.
5. Wait for propagation (minutes–48h; lower TTL beforehand to speed it). Vercel **auto-provisions SSL** once verified. Confirm with `dig compengsoc.org +short` and a browser load of `https://compengsoc.org` and `https://compengsoc.org/studio`.

> The Studio rides along on the same domain at `/studio` — no separate `*.sanity.studio` host is needed. (You *may* additionally run `npx sanity deploy` to publish a standalone `*.sanity.studio` mirror if you ever want the editor on a different domain; it's optional.)

### 5.5.5 Handover checklist (do this every committee turnover)
- Transfer the **GitHub org**, **Vercel team/project**, **Sanity organisation**, and **domain registrar** logins to society credentials (a shared society account / password manager), **not** an individual's personal accounts. This is the single most common way student-society sites die.
- New tech lead → **Sanity Administrator** + **Vercel** member + **GitHub** admin. Graduating lead → removed.
- New content execs → **Sanity Editor** seats (free tier = 3; manage seat rotation). (§3.7)
- Keep `.env.example`, this `CLAUDE.md`, and `README.md` current — they are the handover document. The new lead should be able to clone, copy `.env.example` → `.env.local`, fill the IDs from `sanity.io/manage`, run `npm install && npm run dev`, and be productive in minutes.

---

