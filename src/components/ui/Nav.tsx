"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { navLinks } from "./navLinks";
import MobileMenu from "./MobileMenu";

const MENU_ID = "mobile-menu";

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

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

  return (
    <nav
      className="flex items-center gap-4 px-6 py-4 border-b border-solder"
      aria-label="Site navigation"
    >
      <Link
        href="/"
        className="flex items-center gap-2 font-mono text-mono-label uppercase tracking-[0.04em] text-copper hover:text-copper-bright transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
      >
        <Image
          src="/brand/logo.png"
          alt=""
          width={22}
          height={22}
          className="rounded-full"
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
                className={`nav-link font-mono text-mono-label uppercase tracking-[0.04em] focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                  active ? "text-silk" : "text-ghost hover:text-silk"
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
        className="lg:hidden ml-auto inline-flex items-center justify-center min-h-11 min-w-11 text-copper hover:text-copper-bright focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
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
