"use client";

import { Link } from "next-view-transitions";
import { usePathname } from "next/navigation";
import Image from "next/image";

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
      <ul className="flex items-center gap-6 ml-auto" role="list">
        {links.map(({ href, label }) => {
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
    </nav>
  );
}
