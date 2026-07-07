import EventCard from "@/components/modules/EventCard";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Reveal } from "@/components/motion/Reveal";
import type { PastEvent } from "@/lib/types";

/**
 * Recent events — home-page strip of the 3 most recent PAST events (recency,
 * not the featured flag; fed by recentPastEventsQuery). Cards reuse EventCard's
 * de-energized "past" variant per docs/content-map.md §1.3.1 — dim copper,
 * ghost text, no pulsing. Grid collapses to a vertical stack on mobile.
 */
export default function RecentEventsSection({ events }: { events: PastEvent[] }) {
  return (
    <section className="px-6 py-24 border-t border-solder">
      <div className="max-w-5xl mx-auto">
        <p className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost mb-3">
          {"// recent events"}
        </p>
        <SplitHeadline as="h2" weight={[400, 560]} className="font-display text-h2 text-silk">
          Recent events
        </SplitHeadline>

        {events.length === 0 ? (
          <p className="mt-8 font-mono text-mono-label tracking-[0.04em] text-ghost">
            {"// no signal history — event archive empty"}
          </p>
        ) : (
          <Reveal className="mt-8 grid gap-4 md:grid-cols-3">
            {events.map((event) => (
              <EventCard key={event._id} event={event} variant="past" />
            ))}
          </Reveal>
        )}
      </div>
    </section>
  );
}
