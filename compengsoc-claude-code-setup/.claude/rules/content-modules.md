---
paths:
  - "src/components/modules/**"
  - "src/app/**"
---

# Working on pages & content modules

The utility-as-art mapping for each module (events → Signal Timeline, sponsors → Power Delivery Network, etc.) and the exact About copy are in `docs/content-map.md` — read it before building a module so the metaphor matches what's already been designed instead of improvising a new one.

Must hold:
- Pages (`src/app/**`) fetch via `src/lib/content.ts` only, then pass typed props down. No GROQ, no `client.fetch`, no business logic in a page body.
- Every module's primary content is a real, large, keyboard-reachable click target. The hardware styling (waveform, grid, rail) sits behind it with `pointer-events: none` and is `aria-hidden`.
- Hover-only information must also exist somewhere keyboard/focus-reachable (a detail page or a focus-triggered panel) — never hover-only.
- Event "upcoming/past" status is computed from `startDateTime` at render time. Never store or trust a manual status flag.
- Empty/error states use the machine-voice copy pattern (`// signal idle — no upcoming events on the bus`), not a generic spinner-forever or blank div.
