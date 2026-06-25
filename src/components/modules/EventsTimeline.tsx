import type { PastEvent, UpcomingEvent } from "@/lib/types";
import EventCard from "@/components/modules/EventCard";

type Props = {
  upcoming: UpcomingEvent[];
  past: PastEvent[];
};

export default function EventsTimeline({ upcoming, past }: Props) {
  return (
    <div className="px-6 py-10 space-y-14">
      <section>
        <h2 className="font-mono text-mono-label uppercase tracking-[0.04em] text-copper mb-6">
          Upcoming
        </h2>
        {upcoming.length === 0 ? (
          <p className="font-mono text-mono-label tracking-[0.04em] text-ghost">
            // signal idle — no upcoming events on the bus
          </p>
        ) : (
          <ul
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
          >
            {upcoming.map((e) => (
              <li key={e._id}>
                <EventCard event={e} variant="upcoming" />
              </li>
            ))}
          </ul>
        )}
      </section>

      {past.length > 0 && (
        <section>
          <h2 className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost mb-6">
            Past
          </h2>
          <ul
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            role="list"
          >
            {past.map((e) => (
              <li key={e._id}>
                <EventCard event={e} variant="past" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
