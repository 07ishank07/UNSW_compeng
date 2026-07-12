import type { SanityImage } from "@/lib/types";
import { DuotoneImage } from "./DuotoneImage";

type Accent = "gold" | "crimson" | "teal";

const ACCENT_VAR: Record<Accent, string> = {
  gold: "var(--color-accent-gold)",
  crimson: "var(--color-crimson-soft)",
  teal: "var(--color-slate-soft)",
};

type Props = {
  image: SanityImage | null;
  /** Accessible name when the image is real; pass "" inside an already-titled link. */
  alt: string;
  eventType: string;
  aspectClass?: string;
  /** Checker tint of the placeholder — match the section's accent. */
  accent?: Accent;
  sizes?: string;
  width?: number;
  className?: string;
  /** "thumb" = the compact row cell (home recent-events list). */
  variant?: "panel" | "thumb";
};

/**
 * EventImage — every event's media slot. A real Sanity `heroImage` renders as a
 * crimson-duotone photo; until an editor uploads one, an AESTHETIC placeholder
 * holds the exact same box: a near-black well with a pixel-checker tint of the
 * section accent, the event type as the frame's label, and a machine-voice
 * `// frame pending` corner note. Same aspect both ways → zero reflow on upload.
 */
export default function EventImage({
  image,
  alt,
  eventType,
  aspectClass = "aspect-[3/2]",
  accent = "crimson",
  sizes,
  width,
  className = "",
  variant = "panel",
}: Props) {
  const checker: React.CSSProperties = {
    backgroundImage: `repeating-conic-gradient(${ACCENT_VAR[accent]} 0% 25%, transparent 0% 50%)`,
    backgroundSize: "6px 6px",
    opacity: 0.14,
  };

  if (variant === "thumb") {
    // Compact list cell — checker + 3-letter type tag; upgraded to the photo
    // automatically when the event carries one.
    return (
      <span
        aria-hidden="true"
        className={`relative hidden h-12 w-16 shrink-0 items-center justify-center overflow-hidden rounded-control border border-hairline bg-base-deep/70 sm:flex ${className}`}
      >
        {image?.asset?._ref ? (
          <DuotoneImage
            image={image}
            alt=""
            duotone="crimson"
            aspectClass="aspect-[4/3]"
            width={128}
            sizes="64px"
            className="absolute inset-0"
          />
        ) : (
          <>
            <span aria-hidden="true" className="absolute inset-0" style={checker} />
            <span className="relative font-mono text-[10px] uppercase tracking-widest text-ink-muted">
              {eventType.slice(0, 3)}
            </span>
          </>
        )}
      </span>
    );
  }

  if (image?.asset?._ref) {
    return (
      <DuotoneImage
        image={image}
        alt={alt}
        duotone="crimson"
        aspectClass={aspectClass}
        width={width ?? 1024}
        sizes={sizes ?? "(max-width: 1024px) 100vw, 1024px"}
        className={className}
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={`relative flex items-center justify-center overflow-hidden rounded-control border border-hairline bg-base-deep/70 ${aspectClass} ${className}`}
    >
      <span aria-hidden="true" className="absolute inset-0" style={checker} />
      <span className="relative font-mono text-mono-label uppercase tracking-widest text-ink-muted">
        [ {eventType} ]
      </span>
      <span className="absolute bottom-2 right-3 font-mono text-[10px] uppercase text-ink-muted/80">
        {"// frame pending"}
      </span>
    </div>
  );
}
