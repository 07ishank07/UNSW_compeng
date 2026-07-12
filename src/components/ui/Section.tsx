import type { ReactNode } from "react";
import { Container } from "./Container";
import { SectionField } from "@/components/depth/SectionField";
import type { SignalShape } from "@/components/depth/ditherShader";

/**
 * Section — the one reusable "station" band (SIGNAL Phase 2). A `relative isolate
 * overflow-hidden` region that optionally hosts its OWN pixel field (behind, -z-20)
 * under a text scrim (-z-10), with content in a `<Container>`. Omit `field` for a
 * calm shell band. This is a server component (no client JS itself); the field it
 * renders is the client leaf. One width, one rhythm, site-wide.
 */
export type FieldConfig = {
  shape: SignalShape;
  front: string; // a design-token hex (tokens.*), never a literal
  back?: string;
  opacity?: number;
  speed?: number;
  seed?: number;
};

type Props = {
  children: ReactNode;
  field?: FieldConfig;
  /** Text veil over the field. Defaults: "panel" when a field is present, else "none". */
  scrim?: "pool" | "panel" | "none";
  rhythm?: "section" | "band";
  /** Skip the inner <Container> (full-bleed rows like the ticker). */
  bleed?: boolean;
  as?: "section" | "div";
  className?: string;
  id?: string;
  ariaLabelledby?: string;
};

const RHYTHM = {
  section: "py-20 lg:py-28",
  band: "py-12 lg:py-16",
} as const;

const SCRIM = {
  pool: "scrim",
  panel: "scrim-panel",
  none: "",
} as const;

export function Section({
  children,
  field,
  scrim,
  rhythm = "section",
  bleed = false,
  as: Tag = "section",
  className = "",
  id,
  ariaLabelledby,
}: Props) {
  const scrimClass = SCRIM[scrim ?? (field ? "panel" : "none")];
  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledby}
      className={`relative isolate scroll-mt-20 overflow-hidden ${RHYTHM[rhythm]} ${className}`}
    >
      {field && <SectionField {...field} />}
      {scrimClass && <div aria-hidden="true" className={`${scrimClass} absolute inset-0 -z-10`} />}
      {bleed ? children : <Container>{children}</Container>}
    </Tag>
  );
}
