import { Link } from "next-view-transitions";
import { formatDate } from "@/lib/dates";
import type { PastEvent, UpcomingEvent } from "@/lib/types";
import EventCard from "@/components/modules/EventCard";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrimPool } from "@/components/ui/ScrimPool";
import CopperSeam from "@/components/ui/CopperSeam";
import { FIELD } from "@/lib/fieldRecipes";

type Props = {
  upcoming: UpcomingEvent[];
  past: PastEvent[];
};

/**
 * Events timeline — two separated stations, each with its OWN field (SIGNAL
 * Phase 2): Upcoming rides a gold ripple with the soonest event as a matte
 * poster + an aligned 2-up grid; Past is a teal-dot archive of single-column
 * hairline rows (no more two-column drift). Status is the caller's startDateTime
 * split, never a flag; rows batch-reveal and keep list semantics. Both stations
 * always render, with machine-voice empty states.
 */
export default function EventsTimeline({ upcoming, past }: Props) {
  const [featured, ...restUpcoming] = upcoming;

  return (
    <>
      {/* Seam between the crimson header wave and the gold Upcoming station. */}
      <CopperSeam />

      <Section
        field={{ ...FIELD.gold, shape: "ripple", opacity: 0.85, seed: 1.7 }}
        scrim="none"
        ariaLabelledby="upcoming-h"
      >
        {/* Open colour (Rev 3): the gold ripple runs edge to edge — no opaque
            veil. The heading rides a tight pool; the cards are opaque panels. */}
        <ScrimPool className="px-5 pb-1 pt-5 sm:px-7 sm:pt-7">
          <SectionHeading
            id="upcoming-h"
            index="01"
            title="Upcoming"
            count={`// ${upcoming.length} on the bus`}
            accentClass="text-accent-gold"
          />
        </ScrimPool>
        {upcoming.length === 0 ? (
          <ScrimPool className="mt-2 w-fit px-5 py-4">
            <p className="font-mono text-mono-label text-ink-muted">
              {"// signal idle — no upcoming events on the bus"}
            </p>
          </ScrimPool>
        ) : (
          <div className="mt-6 space-y-6">
            {featured && <EventCard event={featured} featured />}
            {restUpcoming.length > 0 && (
              <Reveal stagger role="list" className="grid gap-6 sm:grid-cols-2">
                {restUpcoming.map((e) => (
                  <div key={e._id} role="listitem" className="h-full">
                    <EventCard event={e} />
                  </div>
                ))}
              </Reveal>
            )}
          </div>
        )}
      </Section>

      {/* Seam between Upcoming and the teal Past archive. */}
      <CopperSeam />

      <Section
        field={{ ...FIELD.teal, shape: "dots", opacity: 0.78, seed: 3.4 }}
        scrim="none"
        ariaLabelledby="past-h"
      >
        {/* One pool hugs the whole archive block (heading + rows) so the rows
            stay AA while the teal dot-matrix owns the section's margins. */}
        <ScrimPool className="p-5 sm:p-7">
          <SectionHeading
            id="past-h"
            index="02"
            title="Past"
            count={`// ${past.length} logged`}
            accentClass="text-slate-soft"
          />
          {past.length === 0 ? (
            <p className="font-mono text-mono-label text-ink-muted">
              {"// no signal history — archive empty"}
            </p>
          ) : (
            <Reveal stagger role="list" className="flex flex-col">
              {past.map((e) => (
                <Link
                  key={e._id}
                  role="listitem"
                  href={`/events/${e.slug}`}
                  className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-hairline py-4 transition-colors hover:bg-surface/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold sm:grid-cols-[9.5rem_1fr_auto] motion-reduce:transition-none"
                >
                  <span className="col-span-2 font-mono text-mono-label uppercase tabular-nums text-ink-muted sm:col-span-1">
                    <time dateTime={e.startDateTime}>{formatDate(e.startDateTime)}</time>
                  </span>
                  <span className="vf-shift text-balance font-display text-h3 text-ink-muted line-clamp-2 transition-colors group-hover:text-ink motion-reduce:transition-none">
                    {e.title}
                  </span>
                  <span className="hidden font-mono text-mono-label uppercase text-ink-muted sm:block">
                    {e.eventType}
                  </span>
                </Link>
              ))}
            </Reveal>
          )}
        </ScrimPool>
      </Section>
    </>
  );
}
