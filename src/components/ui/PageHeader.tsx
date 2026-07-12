import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ScrambleLabel } from "@/components/motion/ScrambleLabel";
import { Container } from "./Container";
import { SectionField } from "@/components/depth/SectionField";
import type { FieldConfig } from "./Section";

/**
 * PageHeader — the route-level header station. Transparent over its OWN pixel
 * field (SIGNAL Phase 2: pass `signal`) with a scrim pool for text AA and a
 * bottom hairline. The mono label is structural machine voice (// signal-timeline,
 * // memory-map…), decoding once via ScrambleLabel with the gold energized pad;
 * the h1 renders at --text-h1-page. One width via <Container> (migrates in lockstep
 * with the modules below it so header/body edges never diverge).
 */
type Field = "crimson" | "slate" | "purple" | "raised" | "raised-gold";

type Props = {
  label: string;
  title: string;
  subtitle?: string;
  /** @deprecated legacy hue hint (data-field only) — use `signal`. */
  field?: Field;
  /** The header's own pixel station, behind the scrim pool. */
  signal?: FieldConfig;
};

export default function PageHeader({ label, title, subtitle, field, signal }: Props) {
  return (
    <header
      data-field={field}
      className="relative isolate overflow-hidden border-b border-hairline py-16 lg:py-20"
    >
      {signal && <SectionField {...signal} />}
      {/* Scrim pool — text stays AA over the animated field (globals.css .scrim). */}
      <div aria-hidden="true" className="scrim absolute inset-0 -z-10" />
      <Container>
        <p className="mb-4 flex items-center gap-3 font-mono text-mono-label uppercase text-ink-muted">
          {/* Gold pad chip — the route's energized pad on the colour field. */}
          <span aria-hidden="true" className="h-2.5 w-2.5 border border-hairline bg-accent-gold" />
          <ScrambleLabel text={label} />
        </p>
        <SplitHeadline
          as="h1"
          dramatic
          className="text-balance font-display font-medium text-h1-page text-ink"
        >
          {title}
        </SplitHeadline>
        {subtitle && (
          <p className="mt-4 max-w-[65ch] text-pretty text-body text-ink-muted">{subtitle}</p>
        )}
      </Container>
    </header>
  );
}
