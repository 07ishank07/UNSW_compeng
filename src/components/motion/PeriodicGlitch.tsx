"use client";
/**
 * PeriodicGlitch — fires the retro glitch (glitch.ts) on an ambient timer, on top
 * of the meaning-triggered glitches (HeroGate energize, SplitHeadline reveal).
 *
 * One concern: scheduling only. It reuses fireGlitch and finds its targets by the
 * JS-only marker classes `.js-glitch-img` (image variant) and `.js-glitch-text`
 * (text variant), so it stays decoupled from the target components — no shared
 * refs, no API changes.
 *
 * Guarantees (per docs/checklists.md motion rules):
 *  - Purely time-based: a fresh random delay in [8s, 15s] each tick, via recursive
 *    setTimeout (not setInterval, so each interval is re-randomised). Reads no
 *    scroll position / document height.
 *  - Page Visibility aware: pauses entirely while the tab is hidden (clears the
 *    pending timeout on `visibilitychange`) and reschedules a fresh delay when it
 *    becomes visible again — never a bare interval ticking in a background tab.
 *  - Disabled under reduced motion: the effect never schedules anything (and
 *    fireGlitch is itself a no-op under reduced motion = double safety).
 */
import { useEffect } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { fireGlitch } from "./glitch";

const MIN_MS = 8_000;
const MAX_MS = 15_000;
const nextDelay = () => MIN_MS + Math.random() * (MAX_MS - MIN_MS);

export function PeriodicGlitch() {
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    if (reduced) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      timer = setTimeout(() => {
        document
          .querySelectorAll(".js-glitch-img")
          .forEach((el) => fireGlitch(el, { img: true }));
        document
          .querySelectorAll(".js-glitch-text")
          .forEach((el) => fireGlitch(el));
        schedule();
      }, nextDelay());
    };

    const onVisibility = () => {
      if (document.hidden) {
        if (timer) clearTimeout(timer);
        timer = undefined;
      } else {
        schedule();
      }
    };

    // Don't fire immediately on mount — wait a full randomised interval first.
    if (!document.hidden) schedule();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      if (timer) clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduced]);

  return null;
}
