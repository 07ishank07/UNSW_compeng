import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Instagram follow CTA — a styled card in the design system, NOT an embedded
 * widget/iframe (an embed pulls a heavy third-party script and breaks the perf
 * budget, docs/checklists.md §2.1). Follows the AcademicCell external-link
 * convention: target="_blank" + rel="noopener noreferrer" + an `Open ↗` mono glyph.
 *
 * Mirrors About/Contact: a mono label + SplitHeadline h2 (real heading, energize
 * reveal) above the card. `url` is sourced from siteSettings.socials (instagram)
 * by the page, falling back to the canonical handle.
 */
export default function InstagramCta({ url }: { url: string }) {
  return (
    <section className="px-6 py-24 border-t border-solder">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost mb-3">
          {"// social · instagram"}
        </p>
        <SplitHeadline as="h2" weight={[400, 560]} className="font-display text-h2 text-silk">
          Follow us on Instagram
        </SplitHeadline>

        <Reveal className="mt-8">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border border-solder hover:border-copper hover:shadow-[0_0_24px_color-mix(in_srgb,var(--color-copper)_16%,transparent)] p-8 lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          >
            <p className="text-body text-ghost max-w-xl">
              Event drops, build photos, and the day-to-day of a society being soldered together in
              real time. Tap in at{" "}
              <span className="text-copper group-hover:text-copper-bright">@unswcompengsoc</span>.
            </p>
            <span className="inline-block mt-6 font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
              Open ↗
            </span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
