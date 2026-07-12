import { SplitHeadline } from "@/components/motion/SplitHeadline";

/**
 * SectionHeading — the shared "station" heading used by every sectioned page
 * (Events, Academics, Blog, Team…): a mono index + a display h2 that reveals on
 * scroll (SplitHeadline gate), an optional right-aligned mono count, over one
 * hairline rule. Keeps the monotonic type hierarchy (h2 section > title-card >
 * h3 item) and one heading vocabulary site-wide.
 */
type Props = {
  /** id target for the Section's aria-labelledby. */
  id?: string;
  /** Mono index like "01" (station number). */
  index?: string;
  title: string;
  /** Mono machine-voice tally, e.g. "// 3 on the bus". */
  count?: string;
  /** Tailwind text-colour class for the index (the section's accent). */
  accentClass?: string;
};

export function SectionHeading({ id, index, title, count, accentClass = "text-accent-gold" }: Props) {
  return (
    <div className="mb-8 flex items-baseline gap-4 border-b border-hairline pb-4">
      {index && (
        <span aria-hidden="true" className={`font-mono text-mono-label tabular-nums ${accentClass}`}>
          {index}
        </span>
      )}
      <SplitHeadline
        as="h2"
        gate
        id={id}
        className="text-balance font-display font-medium text-h2 text-ink"
      >
        {title}
      </SplitHeadline>
      {count && (
        <span className="ml-auto shrink-0 self-baseline font-mono text-mono-label text-ink-muted">
          {count}
        </span>
      )}
    </div>
  );
}
