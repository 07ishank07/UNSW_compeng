import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Reveal } from "@/components/motion/Reveal";
import type { SiteSettings } from "@/lib/types";

/**
 * Get in touch — the §1.1 "Join / contact" closing block: a power-connector CTA
 * pulling email / newsletter / socials from siteSettings. External links follow
 * the AcademicCell convention (new tab + rel + `↗`); mailto opens in-place.
 * Missing fields degrade to machine-voice empty copy, never a blank.
 */
export default function ContactSection({ settings }: { settings: SiteSettings | null }) {
  const email = settings?.contactEmail ?? null;
  const newsletterUrl = settings?.newsletterUrl ?? null;
  // The Instagram social has its own section above — keep the rest here.
  const socials = (settings?.socials ?? []).filter((s) => s.platform !== "instagram");

  const hasChannels = Boolean(email || newsletterUrl || socials.length);

  return (
    <section className="px-6 py-24 border-t border-solder">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost mb-3">
          {"// connect"}
        </p>
        <SplitHeadline as="h2" weight={[400, 560]} className="font-display text-h2 text-silk">
          Get in touch
        </SplitHeadline>

        <Reveal className="mt-8">
          <p className="text-body text-ghost max-w-xl mb-8">
            Questions, sponsorship, or just want to join the bench? Pull up a connector.
          </p>

          {hasChannels ? (
            <ul className="flex flex-wrap gap-3" role="list">
              {email && (
                <li>
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center min-h-11 px-5 border border-solder hover:border-copper hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-copper)_14%,transparent)] lift font-mono text-mono-label uppercase tracking-[0.04em] text-silk focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                  >
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
                    className="inline-flex items-center min-h-11 px-5 border border-solder hover:border-copper hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-copper)_14%,transparent)] lift font-mono text-mono-label uppercase tracking-[0.04em] text-silk focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
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
                    className="inline-flex items-center min-h-11 px-5 border border-solder hover:border-copper hover:shadow-[0_0_20px_color-mix(in_srgb,var(--color-copper)_14%,transparent)] lift font-mono text-mono-label uppercase tracking-[0.04em] text-silk focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
                  >
                    {s.platform} ↗
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-mono-label text-ghost">
              {"// channels offline — check back soon"}
            </p>
          )}
        </Reveal>
      </div>
    </section>
  );
}
