"use client";
/**
 * MobileMenu — full-screen overlay nav for mobile (< lg). The desktop bar is
 * hidden via Tailwind in Nav; this is shown via the hamburger there.
 *
 * Accessibility / behaviour:
 *  - Always in the DOM; when closed it is `inert` + pointer-events-none + opacity-0
 *    (removed from tab order and the a11y tree), so no JS conditional render →
 *    no hydration mismatch.
 *  - Escape closes; clicking the backdrop (outside the links/close button) closes.
 *  - Focus moves to the close button on open; a Tab focus-trap keeps focus inside.
 *    Returning focus to the trigger is handled by Nav.
 *  - Scroll lock stops the live Lenis instance (lenisStore.stop()/start()) AND
 *    locks the document's overflow/overscroll on every device — Lenis isn't wired
 *    for touch, so its stop() alone wouldn't hold back native finger-drag scrolling
 *    (and under reduced motion Lenis never boots at all).
 *  - Open/close transition uses ENERGIZE_BEZIER + DURATION from lib/easing.ts;
 *    instant under reduced motion.
 */
import { Link } from "next-view-transitions";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { lenisStore } from "@/lib/lenisStore";
import { DURATION, ENERGIZE_BEZIER } from "@/lib/easing";
import { navLinks } from "./navLinks";

type Props = { open: boolean; onClose: () => void; id: string };

export default function MobileMenu({ open, onClose, id }: Props) {
  const reduced = usePrefersReducedMotion();
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  // Scroll lock. lenis.stop() halts smooth wheel scrolling, but Lenis isn't
  // configured for touch, so native finger-drag would still scroll the page
  // behind the menu on phones (the menu's primary device). So lock the document
  // directly on every device too, and restore the prior values on close.
  useEffect(() => {
    if (!open) return;
    lenisStore.get()?.stop();
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    const prevOverscroll = root.style.overscrollBehavior;
    root.style.overflow = "hidden";
    root.style.overscrollBehavior = "none";
    return () => {
      lenisStore.get()?.start();
      root.style.overflow = prevOverflow;
      root.style.overscrollBehavior = prevOverscroll;
    };
  }, [open]);

  // Move focus into the menu on open.
  useEffect(() => {
    if (open) closeBtnRef.current?.focus();
  }, [open]);

  // Escape to close + Tab focus-trap.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusables = overlayRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const transition = {
    transitionProperty: "opacity, transform",
    transitionDuration: `${reduced ? 0 : DURATION.base}s`,
    transitionTimingFunction: `cubic-bezier(${ENERGIZE_BEZIER})`,
  } as const;

  return (
    <div
      ref={overlayRef}
      id={id}
      inert={!open}
      aria-hidden={!open}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={transition}
      className={`lg:hidden fixed inset-0 z-50 flex flex-col bg-substrate/97 backdrop-blur-sm ${
        open ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      }`}
    >
      <div className="flex justify-end p-4">
        <button
          ref={closeBtnRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="inline-flex items-center justify-center min-h-11 min-w-11 text-copper hover:text-copper-bright font-mono text-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          ✕
        </button>
      </div>

      <nav aria-label="Mobile navigation" className="flex-1 flex flex-col items-center justify-center gap-2">
        <ul className="flex flex-col items-center gap-2" role="list">
          {navLinks.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center justify-center min-h-11 px-6 font-display text-h2 tracking-tight focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                    active ? "text-silk" : "text-ghost hover:text-silk"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
