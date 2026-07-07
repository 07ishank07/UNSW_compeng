> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §1 — WEBPAGE UTILITY & CONTENT MAP

## 1.0 Route inventory

| Route | Source | Purpose |
|-------|--------|---------|
| `/` | static + Sanity (featured events, sponsor marquee) | Home / hero masterpiece + section overview |
| `/about` | static copy (§1.2) | Who CompEngSoc is |
| `/events` | Sanity `event` | Signal Timeline — upcoming + past |
| `/events/[slug]` | Sanity `event` | Single event "datasheet" |
| `/academics` | Sanity `academicResource` | Memory Map of resources |
| `/sponsors` | Sanity `sponsor` | Power Delivery Network (tiered) |
| `/blog` | Sanity `post` | Changelog |
| `/blog/[slug]` | Sanity `post` | Single post |
| `/team` | Sanity `execMember` | The Board (exec roster) |
| `/studio/[[...tool]]` | embedded Sanity Studio | Admin content portal |

## 1.1 Home page — the visual masterpiece (spec, not loose direction)

> **Superseded by the visual-revision pass:** the hero is no longer a WebGL `<Canvas>`/shader "Substrate." It is now the layered-2D **"Gate"** (`src/components/depth/HeroGate.tsx`, see `docs/design-language.md` §0.2.4): stacked CSS/SVG layers (glow, board card, plate, logo mark, sheen, scanlines) with rAF-throttled pointer parallax, an energize+glitch on scroll, and a `SplitText` weight-morph wordmark reveal. The boot-sequence/probe-cursor notes below are aspirational/historical; the CTA + wordmark + mono-subtitle copy still hold.

**Above the fold — "The Substrate":**
- Full-viewport R3F `<Canvas>` rendering the procedural silicon-die shader (§A.1). Behind it, `--color-substrate`.
- Boot sequence on first paint (≤ ~1.2s): rails charge → die powers → wordmark resolves silkscreen-outline → copper fill (SplitText/clip reveal on the display face). Skipped instantly under reduced motion (die shown in steady state, wordmark already filled).
- Wordmark: **CompEngSoc** (display face) + machine-voice subtitle in mono: `// UNSW Computer Engineering Society · est. 2026`.
- One-line human thesis under it (body face): *"Where silicon meets software."*
- **Primary CTA — "Learn more"** → `https://www.unsw.edu.au/engineering/study-with-us/study-areas/computer-engineering` (opens in a new tab, `rel="noopener noreferrer"`). Styled as an ENIG-gold pad; on hover it "energizes" (gold → bright, faint signal ring). This button is mandatory and links exactly to that URL.
- Probe cursor active; idle clock pulses crossing the die.

**The Trace begins** at the hero's bottom edge and runs down through every following section (§0.2.3). Each section is a labelled "component" soldered to the bus, its via lighting as it enters view.

**Section flow down the page (each links to its full route):**
1. **About teaser** — two or three lines from §1.2 + "Read more" → `/about`.
2. **Upcoming events strip** — the 3 nearest `featured`/soonest events as energized nodes on a horizontal mini-timeline → `/events`.
3. **Academics teaser** — a small Memory Map preview (a few resource cells) → `/academics`.
4. **Sponsors marquee** — a quiet rail of sponsor pads, top tier brightest → `/sponsors`.
5. **Join / contact** — a closing "power connector" CTA block (Discord/socials/newsletter links from `siteSettings`).

**Footer** — silkscreen-style: copyright `© CompEngSoc {year}`, socials, a discreet `/studio` link for execs, and a mono build-stamp.

## 1.2 The "About Us" blurb — polished copy (use verbatim or lightly edited)

> **Primary block (for `/about` hero + home teaser):**
>
> CompEngSoc is brand new. We were founded in 2026 — the first society at UNSW built specifically for **Computer Engineering**, the discipline that lives where silicon meets software. We started this year with a small founding cohort and a deliberately large ambition: to become one of the flagship societies on campus, the place every Computer Engineering student calls home from their first week to their last.
>
> We exist to close the distance between the lecture theatre and the lab bench. That means hands-on hardware nights, free peer tutoring for the courses that break people, a project culture that ships real things — FPGAs, PCBs, embedded systems — and an open line to the industry that hires our members. Social events, study support, and serious engineering, under one roof.
>
> We're early, and that's the point. The people who join now aren't joining something finished — they're soldering the first connections of what comes next. Pull up a seat at the bench.

> **Short subhead (≤ 240 chars, for the home teaser / meta description):**
>
> Founded in 2026, CompEngSoc is UNSW's home for Computer Engineering — hardware nights, free tutoring, real projects, and industry access — built by its founding cohort to become a flagship society. Pull up a seat at the bench.

> **Tagline options (pick one as the persistent brand line):**
> - *Where silicon meets software.*
> - *From first principles to first silicon.*
> - *The home of Computer Engineering at UNSW.*

*(The reference society — ELSOC, founded 1954, 1000+ members, Arc People's Choice Club of the Year 2010 & 2014 — is Electrical Engineering's society. Our copy deliberately inverts that "established legacy" framing into a "founding moment" one: the appeal is being early to something that will be big, not joining something already large.)*

## 1.3 Utility-as-art module mapping

Each standard club utility is fetched from Sanity and rendered as a recognised hardware subsystem. **Legibility and accessible interaction come first; the metaphor is the styling layer, never an obstacle.**

### 1.3.1 Events → "Signal Timeline"
- Events render as nodes on a copper bus drawn as a **clock/waveform**. **Upcoming** events are *energized* (gold, gently pulsing); **past** events are *de-energized* (dim copper/ghost). Status derives from `startDateTime` vs now (computed client-side), not a manual flag, so it can never go stale.
- Each event's `eventType` (cruise, camp, workshop, networking, social, hackathon) maps to a "packet type" with a mono label and a small glyph.
- The whole card is one large accessible click target → `/events/[slug]`. The waveform sits behind it (`pointer-events: none`).
- **Hover/focus → a "datasheet" panel** slides in: date/time (mono), location, short description, and a "Get tickets" CTA (`ticketUrl`) when present. Keyboard-reachable; the panel content is also rendered on the detail page so nothing is hover-only.
- Desktop: horizontally scannable timeline. Mobile: vertical stack of datasheet cards (no horizontal scroll).
- Example content to expect: *Vivid Harbour Cruise*, *First-Year Camp*, *Intro-to-FPGA Workshop*.

### 1.3.2 Academics → "Memory Map"
- Resources laid out as an **addressable grid of cells** (a memory map). Each cell shows a mono "address" derived from `courseCode` (e.g. `0x1004 · COMP1511`) and a human title in the body face.
- `category` (wiki, notes, cheat-sheet, PCB, LaTeX guide, video) defines colour-coded **segments** of the map (segments use solder/copper tints, not new colours).
- A cell routes to `externalUrl` (Drive/YouTube/wiki) or to an internal detail view if `body` exists. External links open in a new tab with `rel="noopener noreferrer"` and a small "external" mono glyph.
- The grid is a plain accessible list/grid semantically; the "map" is visual veneer.

### 1.3.3 Sponsors → "Power Delivery Network (PDN)"
- Tiers are **voltage rails**, top-down by value: `platinum` = primary rail (largest, brightest gold, top), then `gold`, `silver`, `partner`. Each sponsor is a **component drawing power from its rail**, logo seated on a pad. This makes the tier hierarchy *structurally* legible (structure = information): a higher tier is visibly a higher, brighter rail.
- Hover/focus energizes the component and reveals its `blurb`; click → `website` (new tab).
- Rail labels in mono carry a playful but tasteful "voltage" (e.g. `PLATINUM · 12V0`, `GOLD · 5V0`) — decorative text only, never overriding the human tier name.

### 1.3.4 Blog → "Changelog"
- Posts as dated entries in a **commit-log-styled list**: mono date/`category` prefix + human headline + excerpt. Fits the engineering identity and reads fast.
- `/blog/[slug]` renders Portable Text body with the body face; code blocks (if any) in mono.

### 1.3.5 Exec team → "The Board"
- Each exec is a labelled **component/IC** on a board: photo on the "package," `role` as a mono "part number," `name` in the body face. Hover/focus reveals socials (LinkedIn/GitHub/email). Ordered by `order`.
- Doubles as the literal governing "board." Keep it a clean accessible grid underneath the styling.

---

*(continues in §2)*

---

