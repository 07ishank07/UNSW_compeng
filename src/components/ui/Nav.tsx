"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { navLinks } from "./navLinks";
import MobileMenu from "./MobileMenu";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const MENU_ID = "mobile-menu";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);
  const reduced = usePrefersReducedMotion();
  const [hidden, setHidden] = useState(false);

  // Close the menu on navigation — adjust state during render (no effect) per
  // React's "you might not need an effect" guidance.
  if (pathname !== prevPath) {
    setPrevPath(pathname);
    setOpen(false);
  }

  // Return focus to the trigger when the menu closes (but not on first render).
  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Hide on scroll-down, reveal on scroll-up. Reads native window scroll (Lenis
  // updates the REAL scroll position, so window.scrollY is accurate whether or
  // not Lenis is running) in a passive listener — a discrete class toggle, NOT a
  // persistent rAF loop, so the two sanctioned rAF loops stay the only two
  // (.claude/rules/motion-canvas.md). Under reduced motion the bar never moves —
  // no sliding chrome. setHidden bails when the value is unchanged, so the vast
  // majority of scroll events do no React work.
  useEffect(() => {
    // Reduced motion: never attach the listener — the bar stays put. The
    // className below also guards on `reduced`, so a stale `hidden` (e.g. after
    // toggling the OS setting mid-scroll) can never strand the bar off-screen.
    if (reduced) return;
    let lastY = window.scrollY;
    const THRESHOLD = 120; // px — the bar is always shown near the top of the page
    const onScroll = () => {
      const y = window.scrollY;
      if (y < THRESHOLD) setHidden(false);
      else if (y > lastY + 4) setHidden(true);
      else if (y < lastY - 4) setHidden(false);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reduced]);

  return (
    <nav
      className={`sticky top-0 z-40 isolate flex items-center gap-4 border-b border-hairline bg-base-deep px-6 py-4 transition-transform motion-reduce:transition-none ${
        hidden && !open && !reduced ? "-translate-y-full" : "translate-y-0"
      }`}
      aria-label="Site navigation"
    >
      <Link
        href="/"
        className="flex items-center gap-2 font-mono text-mono-label uppercase text-ink transition-colors hover:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-gold motion-reduce:transition-none"
      >
        <Image
          src="/brand/logo.png"
          alt=""
          width={22}
          height={22}
          className="rounded-full ring-1 ring-hairline"
          priority
        />
        CompEngSoc
      </Link>

      {/* Desktop links — hidden on mobile (pure CSS, no conditional render). */}
      <ul className="hidden lg:flex items-center gap-6 ml-auto" role="list">
        {navLinks.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`nav-link font-mono text-mono-label uppercase focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-gold ${
                  active ? "text-ink" : "text-ink-muted hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      {/* Mobile hamburger — shown only below lg. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={MENU_ID}
        aria-label="Open menu"
        className="lg:hidden ml-auto inline-flex items-center justify-center min-h-11 min-w-11 text-ink hover:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-gold"
      >
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
          <path
            d="M3 6h16M3 11h16M3 16h16"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <MobileMenu open={open} onClose={() => setOpen(false)} id={MENU_ID} />
    </nav>
  );
}
