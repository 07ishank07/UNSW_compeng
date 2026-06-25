"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/events", label: "Events" },
  { href: "/sponsors", label: "Sponsors" },
  { href: "/academics", label: "Academics" },
  { href: "/blog", label: "Blog" },
  { href: "/team", label: "Team" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav
      className="flex items-center gap-4 px-6 py-4 border-b border-solder"
      aria-label="Site navigation"
    >
      <Link
        href="/"
        className="font-mono text-mono-label uppercase tracking-[0.04em] text-copper hover:text-copper-bright transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
      >
        CompEngSoc
      </Link>
      <ul className="flex items-center gap-6 ml-auto" role="list">
        {links.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className={`font-mono text-mono-label uppercase tracking-[0.04em] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
                pathname.startsWith(href)
                  ? "text-silk"
                  : "text-ghost hover:text-silk"
              }`}
              aria-current={pathname.startsWith(href) ? "page" : undefined}
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
