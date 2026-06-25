import type { Sponsor } from "@/lib/types";

type Props = { sponsor: Sponsor };

export default function SponsorCard({ sponsor }: Props) {
  return (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-solder hover:border-copper p-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
    >
      {/* Logo placeholder — replaced with next/image + urlForImage in live mode */}
      <div
        className="h-16 mb-4 flex items-center justify-center bg-solder/30"
        aria-label={sponsor.alt}
      >
        <span className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
          {sponsor.name}
        </span>
      </div>
      <p className="font-display text-xl text-silk mb-2">{sponsor.name}</p>
      {sponsor.blurb && (
        <p className="text-body text-ghost text-sm leading-relaxed">
          {sponsor.blurb}
        </p>
      )}
      <span className="inline-block mt-4 font-mono text-mono-label uppercase tracking-[0.04em] text-ghost group-hover:text-copper transition-colors">
        Visit ↗
      </span>
    </a>
  );
}
