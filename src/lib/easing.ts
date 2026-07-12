// Motion vocabulary (docs/design-language.md §0.2.5). CSS mirrors live in
// globals.css (--dur-fast/base/slow, --ease-out) — keep the two in sync.
// fast = micro-interactions (hover/press), base = section/element entrances,
// slow = long moves (spec: micro 0.2–0.3s; entrances 0.6–1.0s).
export const DURATION = {
  fast: 0.25,
  base: 0.7,
  slow: 1,
} as const;

// CSS-compatible form of power2.out — use for transitions that can't use GSAP.
// GSAP code uses the string eases "power2.out" / "power3.out" directly.
export const EASE_OUT_CSS = "0.33, 1, 0.68, 1";
