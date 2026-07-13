> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §4 — DIRECTORY SCHEMA & FILE COMMENTARY

## 4.1 Tech stack (locked)

Next.js 16 (App Router, Turbopack default) · React 19 · TypeScript · TailwindCSS v4 (CSS-first `@theme`) · GSAP 3.13+ (ScrollTrigger, DrawSVG, SplitText, CustomEase) — **lazy-loaded via `components/motion/loadGsap.ts`** · Lenis · `next-sanity` + `@sanity/client` + `@sanity/image-url` + `@portabletext/react` · Zod (boundary validation) · ESLint + Prettier. **Hero/depth is layered 2D (CSS/SVG) — Three.js/R3F/postprocessing were removed in the visual-revision pass; `components/canvas/*` and `shaders/*` no longer exist (now `components/depth/*`).**

## 4.2 The tree

```text
compengsoc/
├── CLAUDE.md                      # THIS FILE. The contract + blueprint. Read before editing anything.
├── README.md                      # Human quickstart: clone, env, dev, deploy. Points back to CLAUDE.md for depth.
├── package.json                   # Deps + scripts (dev, build, lint, typecheck, seed). Pin majors per §0.1.
├── tsconfig.json                  # TS config. "strict": true. Path alias "@/*" -> "src/*". Do not loosen strict.
├── next.config.ts                 # Next config (typed). Sanity image domain allowlist; transpile/optimise three if needed.
├── postcss.config.mjs             # Tailwind v4 entry: { plugins: { "@tailwindcss/postcss": {} } }. NOT the v3 setup.
├── eslint.config.mjs              # Flat ESLint config (eslint-config-next). No rule is disabled to hide real errors.
├── .prettierrc                    # Formatting law (see §6). Single source of style; never hand-format against it.
├── .env.local                     # SECRETS + project IDs. GIT-IGNORED. Never committed. (Contents documented in .env.example.)
├── .env.example                   # Committed template of every env var with placeholder values. Keep in sync with code.
├── .gitignore                     # Ignores .env.local, node_modules, .next, dist, .sanity, coverage, etc.
├── sanity.config.ts               # Studio config (defineConfig): plugins, schema, basePath "/studio". (§3.2)
├── sanity.cli.ts                  # Sanity CLI/deploy config (defineCliConfig): projectId, dataset, autoUpdates. (§3.3)
├── open-next.config.ts            # Cloudflare adapter config: which cache/queue/tag-cache implementation to use. (docs/deployment.md §5.2)
├── wrangler.jsonc                 # Worker config: name, compatibility flags, R2/Durable Object bindings, custom domain routing. (§5.2)
├── .dev.vars                      # GIT-IGNORED. Local mirror of .env.local for `wrangler dev`/preview (Workers-runtime-only secrets surface).
├── assets/                        # Design sources (not web-served — public/ carries the exported rasters).
│   └── Logo_circle_ink.svg        # THE vector logo source of record. scripts/generate-brand-assets.mjs derives every raster from it.
├── .github/
│   └── workflows/
│       └── deploy.yml             # CI deploy: push to main / Sanity repository_dispatch / daily cron (re-freezes the
│                                  # upcoming-past event split on the static site) / manual. Runs check → deploy. (§5.6)
│
├── public/                        # Static assets served as-is at the web root. No build step. Keep it lean.
│   ├── fonts/                     # Self-hosted variable/static font files (Clash Display, Switzer, JetBrains Mono).
│   │   ├── ClashDisplay-Variable.woff2
│   │   ├── Switzer-Variable.woff2
│   │   └── JetBrainsMono-Regular.woff2
│   ├── models/                    # glTF/GLB 3D assets (optional PCB/die model). Draco-compressed. Keep < a few hundred KB.
│   │   └── die.glb
│   ├── textures/                  # Texture maps for the substrate shader (noise, normal). Power-of-two, compressed.
│   │   └── noise.png
│   ├── poster/                    # Static fallback images (e.g. die poster) shown when WebGL is unavailable.
│   │   └── substrate-poster.webp
│   ├── og/                        # Open Graph / social share images.
│   │   └── default-og.png
│   ├── favicon.ico
│   ├── icon.svg                   # Maskable app icon (the CompEngSoc mark).
│   └── _headers                   # Cloudflare edge cache rules for /_next/static/* (long-cache, immutable). (§5.2)
│
├── scripts/                       # Node tooling; never part of the shipped bundle.
│   ├── contrast.mjs               # npm run check:contrast — palette-mirror + WCAG contrast gate (blocks merge).
│   ├── perf-probe.mjs             # Screenshots + scroll-fps probe against a running server (playwright-core, installed Chrome).
│   ├── generate-brand-assets.mjs  # npm run brand-assets — regenerates logo.png / icon.png / favicon.ico / default-og.png
│   │                              # from assets/Logo_circle_ink.svg (the committed vector source of record).
│   ├── assert-deploy-env.mjs      # predeploy guard — blocks `npm run deploy` when NEXT_PUBLIC_USE_MOCKS=true or
│   │                              # NEXT_PUBLIC_SITE_URL isn't https (Next env precedence: .env.local beats .env.production).
│   └── seed.ts                    # (FUTURE — not built) pushes data/mocks/* into a DEV dataset via a write token.
│
└── src/
    ├── app/                       # Next.js App Router. Folders = routes; special files = layout/page/route/error/loading.
    │   ├── layout.tsx             # ROOT layout (Server Component). Loads fonts (next/font/local), sets <html>/<body>,
    │   │                          # mounts global Providers (smooth scroll, cursor), renders <Nav/> + {children} + <Footer/>.
    │   ├── globals.css            # THE styling source of truth. @import "tailwindcss"; + @theme tokens (§0.2.1/0.2.2)
    │   │                          # + base layer (cursor:none on pointer-fine, focus-visible rings, reduced-motion resets).
    │   ├── page.tsx               # HOME (Server Component). Fetches featured events + sponsors + settings, composes
    │   │                          # the hero (lazy canvas) + section teasers. No client logic here beyond <dynamic> imports.
    │   ├── error.tsx              # Route-segment error boundary ('use client'). Shows machine-voice error state, retry.
    │   ├── not-found.tsx          # 404 in the board aesthetic ("// address not mapped").
    │   ├── loading.tsx            # Root loading skeleton (boot stripe) shown during server fetch / streaming.
    │   ├── sitemap.ts             # Generates sitemap from Sanity slugs (events, posts) + static routes.
    │   ├── robots.ts              # robots.txt (allow all; point to sitemap). Disallow /studio from indexing.
    │   │
    │   ├── about/
    │   │   └── page.tsx           # /about. Static About copy (§1.2) + pulls tagline/socials from siteSettings.
    │   ├── events/
    │   │   ├── page.tsx           # /events. Server-fetches upcoming + past; renders <SignalTimeline/> (a client module).
    │   │   └── [slug]/
    │   │       └── page.tsx       # /events/[slug]. AWAIT params (Next 16). generateStaticParams + generateMetadata.
    │   ├── academics/
    │   │   └── page.tsx           # /academics. Server-fetches resources; renders <MemoryMap/>.
    │   ├── sponsors/
    │   │   └── page.tsx           # /sponsors. Server-fetches sponsors; renders <PowerDeliveryNetwork/>.
    │   ├── blog/
    │   │   ├── page.tsx           # /blog. Server-fetches posts; renders <Changelog/>.
    │   │   └── [slug]/
    │   │       └── page.tsx       # /blog/[slug]. AWAIT params; PortableText body; generateStaticParams + metadata.
    │   ├── team/
    │   │   └── page.tsx           # /team. Server-fetches execs; renders <BoardRoster/>.
    │   │
    │   ├── studio/
    │   │   └── [[...tool]]/
    │   │       ├── page.tsx        # Embedded Sanity Studio. 'use client'; renders <NextStudio config={config}/>.
    │   │       └── layout.tsx      # Bare layout for Studio (no site Nav/Footer/cursor; sets viewport metadata).
    │   │
    │   └── api/
    │       └── revalidate/
    │           └── route.ts        # (NOT BUILT — by decision.) Shipped architecture is deployment.md §5.5 option 1:
    │                               # publishing fires a repository_dispatch → GitHub Actions rebuild. This route only
    │                               # returns if option 3 (on-demand ISR) is ever adopted. (§A.4 has the reference code.)
    │
    ├── sanity/                     # All CMS code (schemas, client, queries). Mirrors §3. No React UI here except Studio embed.
    │   ├── env.ts                  # Validated env access (projectId, dataset, apiVersion, server-only readToken). (§3.1)
    │   ├── structure.ts            # Curated Studio desk / document grouping. (§3.4)
    │   ├── lib/
    │   │   ├── client.ts           # Published-content read client (useCdn:true). (§3.1)
    │   │   ├── fetch.ts            # server-only tagged fetch wrapper. THE only read path. (§3.1)
    │   │   ├── image.ts            # @sanity/image-url builder (always size at call site). (§3.1)
    │   │   ├── preview.ts          # server-only draft client (useCdn:false + token) for previews. Optional.
    │   │   └── queries.ts          # All GROQ queries, centralised + parameterised. (§3.7)
    │   └── schemaTypes/
    │       ├── index.ts            # Schema registry imported by sanity.config.ts. (§3.6)
    │       ├── objects/
    │       │   ├── blockContent.ts # Portable Text definition. (§3.5)
    │       │   ├── socialLink.ts   # Reusable platform+url object. (§3.5)
    │       │   └── seo.ts          # Optional per-doc SEO overrides. (§3.5)
    │       └── documents/
    │           ├── event.ts
    │           ├── sponsor.ts
    │           ├── execMember.ts
    │           ├── post.ts
    │           ├── academicResource.ts
    │           └── siteSettings.ts # Singleton. (§3.6)
    │
    ├── components/                 # All React UI. Subfoldered by CONCERN so the separation law (§6) is physical.
    │   │
    │   ├── canvas/                 # The masterpiece 3D layer (R3F). Every file here is 'use client' + lazy-loaded.
    │   │   ├── Scene.tsx           # <Canvas> wrapper: capped dpr, frameloop, AdaptiveDpr, Preload, context-loss handling. (§A.3)
    │   │   ├── Substrate.tsx       # The silicon-die mesh + ShaderMaterial; wires uniforms (uTime, uMouse) to the shader.
    │   │   ├── useShaderUniforms.ts# Hook owning uniform refs + the RAF update (time, pointer). Keeps Substrate.tsx declarative.
    │   │   └── HeroCanvas.tsx       # Default-export client component the page lazy-imports (next/dynamic, ssr:false).
    │   │
    │   ├── motion/                 # The GSAP + Lenis system. Pure animation; holds NO content and NO data.
    │   │   ├── SmoothScrollProvider.tsx # 'use client'. Boots one Lenis instance, wires it to ScrollTrigger, respects reduced motion.
    │   │   ├── TraceSpine.tsx       # 'use client'. The signature copper bus: DrawSVG path + scroll-driven signal pulse. (§A.2)
    │   │   ├── Reveal.tsx           # 'use client'. Generic scroll-reveal wrapper (uses the shared `energize` ease + useGSAP).
    │   │   ├── SplitHeadline.tsx    # 'use client'. SplitText character/line reveal for display-face headings.
    │   │   ├── PageTransition.tsx   # 'use client'. The "context switch" between routes (de-energize -> re-energize).
    │   │   └── registerGsap.ts      # Registers plugins (ScrollTrigger, DrawSVGPlugin, SplitText) + the `energize` CustomEase, once.
    │   │
    │   ├── modules/                # The utility-as-art mini-apps. Each fetched data shape -> one hardware subsystem (§1.3).
    │   │   ├── SignalTimeline.tsx   # Events as energized/de-energized nodes; opens DatasheetPanel. Big accessible click targets.
    │   │   ├── DatasheetPanel.tsx   # The slide-in event detail card (also rendered on the detail page; no hover-only info).
    │   │   ├── MemoryMap.tsx        # Academic resources as an addressable cell grid (semantically a list/grid).
    │   │   ├── PowerDeliveryNetwork.tsx # Sponsors as tiered voltage rails; hierarchy = information.
    │   │   ├── Changelog.tsx        # Blog posts as a commit-log list.
    │   │   └── BoardRoster.tsx      # Exec team as labelled ICs on a board.
    │   │
    │   ├── ui/                      # Structural, ALWAYS-interactive primitives. Never decorative-only. Server-safe where possible.
    │   │   ├── Nav.tsx              # Top navigation. Keyboard-operable, visible focus, mobile menu. Sits above decorative layers.
    │   │   ├── Footer.tsx           # Silkscreen footer: copyright, socials, discreet /studio link, build stamp.
    │   │   ├── Button.tsx           # The ENIG-gold "pad" CTA. Renders <a> or <button>; energize on hover; focus ring.
    │   │   ├── LearnMoreButton.tsx  # The mandatory home CTA -> UNSW Computer Engineering URL (new tab, rel=noopener).
    │   │   ├── Tag.tsx              # Mono "machine-voice" label/chip (event type, category, tier voltage).
    │   │   └── SanityImage.tsx      # Thin wrapper over next/image + urlForImage with required alt + sizes.
    │   │
    │   ├── cursor/
    │   │   └── ProbeCursor.tsx      # 'use client'. Custom oscilloscope-probe cursor; magnetic snap; trail. Off on touch/reduced-motion.
    │   │
    │   └── portable-text/
    │       └── components.tsx       # PortableText component map (headings, links, code-in-mono, images via SanityImage).
    │
    ├── shaders/                    # Pure GLSL. No JS, no React. Imported as strings by canvas/* via a glsl loader or raw-import.
    │   ├── substrate.vert.glsl      # Vertex shader for the die plane (passes uv, applies subtle displacement if used).
    │   └── substrate.frag.glsl      # Fragment shader: floorplan pattern + current-flow glow + cursor proximity heat. (§A.1)
    │
    ├── hooks/                       # Reusable client hooks. One concern each.
    │   ├── usePrefersReducedMotion.ts # Subscribes to the media query; every animation reads this before running.
    │   ├── useMousePosition.ts        # Normalised pointer position (for the probe cursor + shader uMouse).
    │   └── useMediaQuery.ts           # Generic matchMedia hook (breakpoints, pointer:fine detection).
    │
    ├── lib/                         # Framework-agnostic TypeScript utilities + constants. No React, no DOM where avoidable.
    │   ├── easing.ts                # The `energize` cubic-bezier/CustomEase definition + named durations. Single motion vocabulary.
    │   ├── design-tokens.ts         # TS mirror of the CSS tokens (hex values) for use inside shaders/canvas (which can't read CSS vars).
    │   ├── dates.ts                 # BUILT (subsumes the planned format.ts + event-status.ts): en-AU date/time formatters
    │   │                            # pinned to Australia/Sydney (UTC CI builds must not shift calendar dates) + isUpcoming().
    │   └── utils.ts                 # cn() classname merge + small generic helpers. Keep tiny; resist a junk-drawer.
    │
    ├── types/                       # Shared TypeScript types.
    │   ├── sanity.ts                # Hand-written or `next typegen`/`sanity typegen`-generated types for fetched documents.
    │   └── index.ts                 # Re-exports + app-level shared types.
    │
    └── data/
        └── mocks/                   # Static mock payloads matching the GROQ result shapes. Powers offline/canvas dev (§5.3).
            ├── events.mock.ts
            ├── sponsors.mock.ts
            ├── exec.mock.ts
            ├── posts.mock.ts
            ├── academics.mock.ts
            └── settings.mock.ts
```

## 4.3 Why the folders are split this way (the architectural intent)

The top-level split inside `src/components/` is the **physical embodiment of the separation law** (§6). Reading the folder a file lives in tells you what kind of code to expect and what it may import:

- **`canvas/`** — 3D/WebGL only. May import `shaders/`, `lib/design-tokens.ts`, `three`, R3F. **Never** imports `modules/` content or Sanity data directly (data is passed in as props). Always `'use client'`, always lazy-loaded.
- **`motion/`** — GSAP/Lenis only. Animates DOM that other components render; holds no copy and fetches no data. May import `lib/easing.ts` and `hooks/usePrefersReducedMotion`.
- **`modules/`** — the data-shaped utility views. Receives already-fetched, already-typed data via props from a Server Component page. Owns layout + interaction for one subsystem. May *use* `motion/` wrappers and `ui/` primitives but does not itself define the global scroll system or shaders.
- **`ui/`** — structural primitives that are *always* real, interactive, accessible controls. These sit **above** decorative layers in the stacking order and are the click targets §0.2/§2.5 protect.
- **`cursor/`, `portable-text/`** — single-purpose leaves.

`shaders/` (pure GLSL), `hooks/`, `lib/` (framework-agnostic logic + the TS token mirror), `types/`, and `data/mocks/` round out the separation: **logic, styling, animation, and shaders never co-habit a file**, and a human editing one of them can predict its neighbours.

> **One subtlety to respect:** shaders and the canvas cannot read CSS custom properties. That is the entire reason `lib/design-tokens.ts` exists — it is the *single* TS mirror of the palette so the WebGL layer stays colour-consistent with the CSS layer. If a token changes in `globals.css`, change it in `design-tokens.ts` in the same commit (a comment in both files cross-references the other).

---

