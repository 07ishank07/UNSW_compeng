import { Link } from "next-view-transitions";
import type { PastEvent, UpcomingEvent } from "@/lib/types";

type Props = {
  event: UpcomingEvent | PastEvent;
  variant: "upcoming" | "past";
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

export default function EventCard({ event, variant }: Props) {
  const isUpcoming = variant === "upcoming";
  const shortDesc =
    "shortDescription" in event ? event.shortDescription : null;
  const ticketUrl = "ticketUrl" in event ? event.ticketUrl : null;

  return (
    <Link
      href={`/events/${event.slug}`}
      className={`group block border p-5 lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold ${
        isUpcoming
          ? "border-copper hover:border-copper-bright hover:shadow-[0_0_28px_color-mix(in_srgb,var(--color-purple)_24%,transparent)]"
          : "border-solder hover:border-copper/40"
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`font-mono text-mono-label uppercase tracking-[0.04em] ${
            isUpcoming ? "text-copper" : "text-ghost"
          }`}
        >
          {EVENT_TYPE_LABELS[event.eventType] ??
            event.eventType.toUpperCase()}
        </span>
        {isUpcoming && (
          <span className="font-mono text-mono-label uppercase tracking-[0.04em] text-gold-bright [text-shadow:0_0_8px_color-mix(in_srgb,var(--color-purple)_80%,transparent)]">
            ● LIVE
          </span>
        )}
      </div>
      <h3
        className={`font-display text-xl leading-tight mb-2 ${
          isUpcoming ? "text-silk" : "text-ghost"
        }`}
      >
        {event.title}
      </h3>
      <p className="font-mono text-mono-label tracking-[0.04em] text-ghost mb-1">
        {formatDateTime(event.startDateTime)}
      </p>
      {event.location && (
        <p className="font-mono text-mono-label tracking-[0.04em] text-ghost mb-3">
          {event.location}
        </p>
      )}
      {shortDesc && (
        <p className="text-body text-ghost text-sm leading-relaxed mb-3">
          {shortDesc}
        </p>
      )}
      {ticketUrl && (
        <span className="inline-block font-mono text-mono-label uppercase tracking-[0.04em] text-gold border border-gold px-3 py-1 transition-colors group-hover:bg-gold-bright group-hover:border-gold-bright group-hover:text-substrate">
          Get Tickets →
        </span>
      )}
    </Link>
  );
}
