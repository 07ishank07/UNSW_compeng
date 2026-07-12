import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Reveal } from "@/components/motion/Reveal";
import { ScrimPool } from "@/components/ui/ScrimPool";
import { InstagramGlyph, DiscordGlyph } from "@/components/ui/SocialGlyphs";
import type { SiteSettings } from "@/lib/types";

/**
 * Get in touch — the §1.1 "Join / contact" closing block. It sits in the
 * home page's cool-down zone: the flowing DitherField has journeyed to its
 * slate/deep end here (docs/design-language.md §0.2.1), so the section is
 * transparent and rides that field. Text sits on a scrim pool for contrast
 * (scripts/contrast.mjs gates ink/gold over the field's brightest patch); GOLD
 * is the single accent — the chips and their hover, not a whole band. This
 * replaces the old full-gold/ink-inverse band that produced the page's most
 * jarring colour-block seam.
 *
 * Contact channels pulled from siteSettings; external links get new tab + rel +
 * `↗`, mailto opens in-place. Missing fields degrade to machine-voice copy.
 */
export default function ContactSection({
  settings,
  instagramUrl,
  discordUrl,
}: {
  settings: SiteSettings | null;
  instagramUrl: string;
  discordUrl: string;
}) {
  const email = settings?.contactEmail ?? null;
  const newsletterUrl = settings?.newsletterUrl ?? null;
  // Instagram/Discord get the big glyph treatment on the right — keep the rest
  // of the socials as chips.
  const socials = (settings?.socials ?? []).filter(
    (s) => s.platform !== "instagram" && s.platform !== "discord",
  );

  const bigChannels = [
    {
      key: "instagram",
      href: instagramUrl,
      label: "Instagram",
      ariaLabel: "Follow CompEngSoc on Instagram",
      Glyph: InstagramGlyph,
    },
    {
      key: "discord",
      href: discordUrl,
      label: "Discord",
      ariaLabel: "Join the CompEngSoc Discord server",
      Glyph: DiscordGlyph,
    },
  ] as const;

  const hasChannels = Boolean(email || newsletterUrl || socials.length);

  const chipClass =
    "inline-flex min-h-11 items-center rounded-control border border-hairline-gold px-5 font-mono text-mono-label uppercase text-ink lift hover:border-accent-gold hover:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold";

  return (
    // Home-band sizing (user recipe): ~¾ screen floor, content centred.
    <section className="flex min-h-[75svh] items-center px-6 py-16 lg:py-20">
      {/* Merged station (Rev 5): Get in touch + the follow glyphs share the one
          purple-spiral band — copy/chips left, the two big channels right. */}
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1fr_auto]">
        <ScrimPool className="max-w-2xl p-6 sm:p-8">
          <div className="mb-4 flex items-center gap-4" aria-hidden="true">
            <span className="font-mono text-mono-label text-ink-muted">03</span>
            <span className="w-10 border-t border-hairline" />
          </div>
          <SplitHeadline as="h2" dramatic gate className="font-display font-medium text-h2 text-ink">
            Get in touch
          </SplitHeadline>

          <Reveal className="mt-7">
            <p className="mb-8 max-w-[55ch] text-body text-ink-muted">
              Questions, sponsorship, or just want to join the bench? Pull up a connector.
            </p>

            {hasChannels ? (
              <ul className="flex flex-wrap gap-3" role="list">
                {email && (
                  <li>
                    <a href={`mailto:${email}`} className={chipClass}>
                      Email
                    </a>
                  </li>
                )}
                {newsletterUrl && (
                  <li>
                    <a
                      href={newsletterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={chipClass}
                    >
                      Newsletter ↗
                    </a>
                  </li>
                )}
                {socials.map((s) => (
                  <li key={s.platform + s.url}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={chipClass}
                    >
                      {s.platform} ↗
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-mono text-mono-label text-ink-muted">
                {"// channels offline — check back soon"}
              </p>
            )}
          </Reveal>
        </ScrimPool>

        {/* The two primary channels — large glyphs on a shared centreline. */}
        <ScrimPool className="w-fit px-10 py-8 sm:px-12">
          <Reveal className="flex items-center gap-12 sm:gap-16">
            {bigChannels.map(({ key, href, label, ariaLabel, Glyph }) => (
              <a
                key={key}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={ariaLabel}
                className="group flex flex-col items-center gap-5 text-ink lift hover:text-accent-gold focus-visible:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-accent-gold"
              >
                <span className="flex h-24 w-24 items-center justify-center" aria-hidden="true">
                  <Glyph className="h-full w-full transition-colors motion-reduce:transition-none" />
                </span>
                <span
                  aria-hidden="true"
                  className="relative font-mono text-mono-label uppercase transition-colors motion-reduce:transition-none"
                >
                  {label}
                  <span className="absolute -bottom-1.5 left-0 right-0 h-px origin-left scale-x-0 bg-accent-gold transition-transform group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none" />
                </span>
              </a>
            ))}
          </Reveal>
        </ScrimPool>
      </div>
    </section>
  );
}
