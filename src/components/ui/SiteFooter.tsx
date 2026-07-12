import { Link } from "next-view-transitions";
import { navLinks } from "./navLinks";

/**
 * SiteFooter — the machine-voice ending every route shares (rendered in the root
 * layout). Hairline-top band: wordmark + copyright rail, the primary nav, and
 * the canonical social channels. Static canonical URLs here — the editable
 * siteSettings socials surface in the home page's Follow/Contact sections; the
 * footer is the always-correct fallback.
 */

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/unswcompengsoc/",
  },
  {
    label: "Discord",
    href: "https://discord.gg/DHFDcaNgSH",
  },
] as const;

const footerLink =
  "inline-flex min-h-11 items-center font-mono text-mono-label uppercase text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-gold motion-reduce:transition-none";

export default function SiteFooter() {
  return (
    <footer className="relative isolate border-t border-hairline-gold px-6 py-12">
      {/* Scrim pool — footer copy stays AA over the field's deepest stretch. */}
      <div aria-hidden="true" className="scrim absolute inset-0 -z-10" />
      <div className="mx-auto grid w-full max-w-6xl gap-10 sm:grid-cols-[1fr_auto_auto] sm:gap-16">
        <div className="flex flex-col gap-2">
          <p className="font-display text-h3 font-medium text-ink">CompEngSoc</p>
          <p className="font-mono text-mono-label text-ink-muted">
            {"// © 2026 UNSW Computer Engineering Society"}
          </p>
        </div>

        <nav aria-label="Footer navigation">
          <ul className="flex flex-col gap-1" role="list">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={footerLink}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="flex flex-col gap-1" role="list">
          {SOCIALS.map(({ label, href }) => (
            <li key={label}>
              <a href={href} target="_blank" rel="noopener noreferrer" className={footerLink}>
                {label} ↗
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
