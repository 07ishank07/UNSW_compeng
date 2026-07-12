import { Link } from "next-view-transitions";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import type { UpcomingEvent } from "@/lib/types";
import EventImage from "@/components/ui/EventImage";

type Props = {
  event: UpcomingEvent;
  /** The soonest upcoming event runs as a wider poster — the section's one loud
   *  title-card. Positional (soonest), never the Sanity `featured` flag. */
  featured?: boolean;
};

const EVENT_TYPE_LABELS: Record<string, string> = {
  social: "SOCIAL",
  workshop: "WORKSHOP",
  networking: "NETWORKING",
  cruise: "CRUISE",
  camp: "CAMP",
  hackathon: "HACKATHON",
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });
}

/**
 * Upcoming-event views — one large keyboard-reachable <Link>. The colour comes
 * from the Section's gold field AROUND the card, so the card itself is a clean
 * MATTE panel (bg-surface + gold hairline) — no loud in-card gradient. featured =
 * the wider poster (title-card title + mono datasheet rail); rest = compact cards.
 * Duotone hero imagery is dormant until real Sanity assets exist.
 */
export default function EventCard({ event, featured = false }: Props) {
  const typeLabel = EVENT_TYPE_LABELS[event.eventType] ?? event.eventType.toUpperCase();

  if (featured) {
    return (
      <Link
        href={`/events/${event.slug}`}
        className="group relative block overflow-hidden rounded-panel border border-hairline-gold bg-surface shadow-panel lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
      >
        <div className="p-6 lg:p-10">
          {/* Media slot — real Sanity hero image, or the aesthetic pixel-checker
              placeholder until an editor uploads one (same box either way). */}
          <EventImage
            image={event.image}
            alt=""
            eventType={event.eventType}
            aspectClass="aspect-[21/9]"
            accent="gold"
            width={1280}
            sizes="(max-width: 1024px) 100vw, 1104px"
            className="mb-6"
          />
          <span className="flex items-center gap-3 font-mono text-mono-label uppercase text-crimson-soft">
            <span aria-hidden="true" className="h-2.5 w-2.5 bg-accent-gold" />
            {typeLabel} · Next up
          </span>

          <div className="mt-6 grid gap-8 lg:grid-cols-[1.2fr_minmax(16rem,0.8fr)] lg:gap-12">
            <div className="flex flex-col">
              <SplitHeadline
                as="h3"
                dramatic
                gate
                className="text-balance font-display font-semibold text-title-card text-ink"
              >
                {event.title}
              </SplitHeadline>
              {event.shortDescription && (
                <p className="mt-4 max-w-[46ch] text-pretty text-body text-ink-muted line-clamp-3">
                  {event.shortDescription}
                </p>
              )}
              {event.ticketUrl && (
                <span className="mt-7 inline-block self-start rounded-control bg-accent-gold px-5 py-2.5 font-mono text-mono-label uppercase text-ink-inverse shadow-ambient transition-colors group-hover:bg-[color-mix(in_oklch,var(--color-accent-gold)_88%,white)] motion-reduce:transition-none">
                  Get tickets →
                </span>
              )}
            </div>

            <dl className="space-y-4 font-mono text-mono-label lg:border-l lg:border-hairline lg:pl-8">
              <div>
                <dt className="text-ink-muted">{"// when"}</dt>
                <dd className="mt-1 text-ink">
                  <time dateTime={event.startDateTime}>{formatDateTime(event.startDateTime)}</time>
                </dd>
              </div>
              {event.location && (
                <div>
                  <dt className="text-ink-muted">{"// where"}</dt>
                  <dd className="mt-1 text-ink">{event.location}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group relative flex h-full flex-col justify-between gap-8 overflow-hidden rounded-panel border border-hairline bg-surface p-6 lift hover:border-hairline-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
    >
      <div>
        <EventImage
          image={event.image}
          alt=""
          eventType={event.eventType}
          aspectClass="aspect-[3/2]"
          accent="gold"
          width={640}
          sizes="(max-width: 640px) 100vw, 544px"
          className="mb-5"
        />
        <span className="font-mono text-mono-label uppercase text-crimson-soft">{typeLabel}</span>
        <h3 className="vf-shift mt-3 text-balance font-display text-h3 text-ink line-clamp-2">
          {event.title}
        </h3>
        {event.shortDescription && (
          <p className="mt-2 max-w-[40ch] text-pretty text-body text-ink-muted line-clamp-2">
            {event.shortDescription}
          </p>
        )}
      </div>
      <div className="font-mono text-mono-label text-ink-muted">
        <p>
          <time dateTime={event.startDateTime}>{formatDateTime(event.startDateTime)}</time>
        </p>
        {event.location && <p className="mt-1">{event.location}</p>}
        {event.ticketUrl && (
          <span className="mt-4 inline-block rounded-control border border-accent-gold px-3 py-1 uppercase text-accent-gold transition-colors group-hover:bg-accent-gold group-hover:text-ink-inverse motion-reduce:transition-none">
            Get tickets →
          </span>
        )}
      </div>
    </Link>
  );
}
