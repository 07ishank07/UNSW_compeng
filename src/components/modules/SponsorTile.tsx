import Image from "next/image";
import type { Sponsor } from "@/lib/types";
import { urlForImage } from "@/sanity/lib/image";

type Props = {
  sponsor: Sponsor;
  /** false for the marquee's aria-hidden clone row — keeps duplicates out of tab order. */
  tabStop?: boolean;
};

/**
 * Sponsor tile — one equal well on the network rail (tiers removed by design:
 * every sponsor renders at the SAME size; rank is only the manual Sanity order).
 * A real logo sits in a neutral well: grayscale at rest, colour on hover/focus —
 * the reveal cross-fades the OPACITY of a grayscale copy over a colour copy
 * (never animating `filter`). Until assets land, a muted wordmark stands in
 * (truncated so long names can never overflow the well).
 */
export default function SponsorTile({ sponsor, tabStop = true }: Props) {
  const logoSrc = sponsor.logo?.asset?._ref
    ? urlForImage(sponsor.logo).width(320).quality(85).url()
    : null;

  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={tabStop ? undefined : -1}
      aria-label={`${sponsor.name} — visit website`}
      className="group relative flex h-24 w-full items-center justify-center overflow-hidden rounded-control border border-hairline bg-surface/70 px-6 lift hover:border-hairline-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
    >
      {logoSrc ? (
        <>
          {/* Colour layer underneath; object-contain + p-4 keeps any logo shape
              tidy in the well. */}
          <Image
            src={logoSrc}
            alt={sponsor.alt || sponsor.name}
            fill
            sizes="240px"
            className="object-contain p-4"
          />
          {/* Grayscale copy on top, fading OUT on hover/focus to reveal colour. */}
          <Image
            src={logoSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="240px"
            className="object-contain p-4 grayscale transition-opacity duration-[var(--dur-fast)] ease-[var(--ease-out)] group-hover:opacity-0 group-focus-visible:opacity-0 motion-reduce:transition-none"
          />
        </>
      ) : (
        // Image-well placeholder until the Sanity logo lands: pixel-checker tint
        // + wordmark + machine-voice note (same well, zero reflow on upload).
        <>
          <span
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-conic-gradient(var(--color-purple-soft) 0% 25%, transparent 0% 50%)",
              backgroundSize: "6px 6px",
              opacity: 0.1,
            }}
          />
          <span className="vf-shift relative max-w-full truncate font-display text-h3 text-ink-muted transition-colors group-hover:text-ink motion-reduce:transition-none">
            {sponsor.name}
          </span>
          <span className="absolute bottom-1.5 right-2.5 font-mono text-[10px] uppercase text-ink-muted/80">
            {"// logo pending"}
          </span>
        </>
      )}
    </a>
  );
}
