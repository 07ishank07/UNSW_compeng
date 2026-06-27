"use client";
/**
 * glitch — fire a brief retro chromatic-aberration + jitter on an element at a
 * meaningful moment (headline reveal complete, section energize, page transition).
 * It is punctuation, never a constant effect, and is a no-op under reduced motion.
 *
 * The visuals live in globals.css as two short keyframes:
 *   fireGlitch(el)              → text/inline (text-shadow chroma) [.glitch-fire]
 *   fireGlitch(el, { img:true })→ images/blocks (drop-shadow)      [.glitch-fire-img]
 */
const prefersReduced = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function fireGlitch(el: Element | null, opts: { img?: boolean } = {}): void {
  if (!el || prefersReduced()) return;
  const cls = opts.img ? "glitch-fire-img" : "glitch-fire";
  el.classList.remove(cls);
  // Force reflow so re-adding the class restarts the animation from 0.
  void (el as HTMLElement).offsetWidth;
  el.classList.add(cls);
  el.addEventListener("animationend", () => el.classList.remove(cls), { once: true });
}
