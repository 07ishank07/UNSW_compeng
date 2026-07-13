import { Link } from "next-view-transitions";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Reveal } from "@/components/motion/Reveal";
import { ScrimPool } from "@/components/ui/ScrimPool";
import EventImage from "@/components/ui/EventImage";
import { formatDate, isUpcoming } from "@/lib/dates";
import type { PastEvent } from "@/lib/types";

/**
 * Upcoming events — home-page strip of up to 3 events: soonest upcoming first,
 * backfilled with the most recent past events when fewer than 3 are on the bus
 * (fed by getHomeEvents). Image-forward column cards, three across; each card's
 * mono rail carries an Upcoming/Recent token derived from startDateTime at
 * render — energized gold glyph for upcoming, de-energized muted for recent
 * (EventCard's "Next up" vocabulary; the label carries the meaning, never the
 * colour alone). NOTE the site is fully static: the split freezes at build and
 * the daily scheduled rebuild (deploy.yml cron) keeps it honest.
 */

export default function UpcomingEventsSection({ events }: { events: PastEvent[] }) {
  return (
    // Home-band sizing (user recipe): ~¾ screen floor, content centred in the
    // band — the hero's min-h vocabulary applied down the page.
    <section className="flex min-h-[75svh] items-center px-6 py-16">
      {/* Content-fitted pool (Rev 3): the crimson wave runs edge to edge; the
          heading + rows sit on a veil that hugs the block, not the section. */}
      <ScrimPool className="mx-auto w-full max-w-6xl p-5 sm:p-7">
        <div className="mb-4 flex items-center gap-4" aria-hidden="true">
          <span className="font-mono text-mono-label text-crimson-soft">02</span>
          <span className="w-10 border-t border-hairline" />
        </div>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SplitHeadline as="h2" dramatic gate className="font-display font-medium text-h2 text-ink">
            Upcoming events
          </SplitHeadline>
          <Link
            href="/events"
            className="font-mono text-mono-label uppercase text-ink-muted transition-colors hover:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-gold motion-reduce:transition-none"
          >
            All events →
          </Link>
        </div>

        {events.length === 0 ? (
          <p className="mt-10 font-mono text-mono-label text-ink-muted">
            {"// signal idle — no events on the bus"}
          </p>
        ) : (
          <Reveal stagger role="list" className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => {
              const upcoming = isUpcoming(event.startDateTime);
              return (
                <Link
                  key={event._id}
                  role="listitem"
                  href={`/events/${event.slug}`}
                  className="group flex flex-col gap-4 rounded-control lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-gold"
                >
                  <EventImage
                    image={event.image}
                    alt=""
                    eventType={event.eventType}
                    aspectClass="aspect-[3/2]"
                    accent="crimson"
                    width={640}
                    sizes="(max-width: 640px) 100vw, 360px"
                  />
                  <span className="flex flex-wrap items-baseline gap-3 font-mono text-mono-label uppercase text-ink-muted">
                    <span
                      className={`inline-flex items-center gap-2 ${upcoming ? "text-crimson-soft" : ""}`}
                    >
                      <span
                        aria-hidden="true"
                        className={`h-2.5 w-2.5 ${upcoming ? "bg-accent-gold" : "bg-ink-muted"}`}
                      />
                      {upcoming ? "Upcoming" : "Recent"}
                    </span>
                    <span aria-hidden="true">·</span>
                    <time dateTime={event.startDateTime} className="tabular-nums">
                      {formatDate(event.startDateTime)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{event.eventType}</span>
                  </span>
                  <span className="vf-shift -mt-2 text-balance font-display text-h3 text-ink line-clamp-2 transition-colors group-hover:text-accent-gold motion-reduce:transition-none">
                    {event.title}
                  </span>
                </Link>
              );
            })}
          </Reveal>
        )}
      </ScrimPool>
    </section>
  );
}
