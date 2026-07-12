import type { ReactNode } from "react";

/**
 * ScrimPool — the content-fitted text veil of the "open colour" model (SIGNAL
 * Rev 3): the section's field fills the band edge-to-edge, and copy sits on this
 * small feathered pool (globals.css .scrim) that hugs — and adapts to — its own
 * content. Replaces the retired full-section .scrim-panel veils. Pass padding
 * via className (e.g. "p-6 sm:p-8"); the radial feather means no hard panel edge.
 */
export function ScrimPool({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative isolate rounded-panel ${className}`}>
      <div aria-hidden="true" className="scrim absolute inset-0 -z-10" />
      {children}
    </div>
  );
}
