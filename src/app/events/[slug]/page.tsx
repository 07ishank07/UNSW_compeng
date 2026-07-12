import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import type { Metadata } from "next";
import { getEventBySlug, getEventStaticParams } from "@/lib/content";
import PageHeader from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { ScrimPool } from "@/components/ui/ScrimPool";
import { FIELD } from "@/lib/fieldRecipes";

export function generateStaticParams() {
  return getEventStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return {};
  return { title: `${event.title} — CompEngSoc` };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const date = new Date(event.startDateTime).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = new Date(event.startDateTime).toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <main>
      <PageHeader
        label={`// ${event.eventType.toUpperCase()}`}
        title={event.title}
        signal={{ ...FIELD.crimson, shape: "wave", opacity: 0.7, seed: 0 }}
      />
      {/* Calm body — the datasheet sits on a content-fitted pool over the shell. */}
      <Container className="py-12">
        <ScrimPool className="max-w-3xl space-y-8 p-6 sm:p-8">
          <dl className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-3">
            <dt className="font-mono text-mono-label uppercase text-ink-muted">
              Date
            </dt>
            <dd className="font-mono text-mono-label text-ink">{date}</dd>
            <dt className="font-mono text-mono-label uppercase text-ink-muted">
              Time
            </dt>
            <dd className="font-mono text-mono-label text-ink">{time}</dd>
            {event.location && (
              <>
                <dt className="font-mono text-mono-label uppercase text-ink-muted">
                  Location
                </dt>
                <dd className="font-mono text-mono-label text-ink">
                  {event.location}
                </dd>
              </>
            )}
            {event.capacity && (
              <>
                <dt className="font-mono text-mono-label uppercase text-ink-muted">
                  Capacity
                </dt>
                <dd className="font-mono text-mono-label text-ink">
                  {event.capacity}
                </dd>
              </>
            )}
          </dl>

          {event.shortDescription && (
            <p className="max-w-[65ch] text-body text-ink-muted">{event.shortDescription}</p>
          )}

          {!event.body && (
            <p className="font-mono text-mono-label text-ink-muted">
              {"// full details published closer to the date"}
            </p>
          )}

          {event.ticketUrl && (
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-control bg-accent-gold px-6 py-3 font-body text-sm font-semibold text-ink-inverse shadow-ambient lift hover:bg-[color-mix(in_oklch,var(--color-accent-gold)_88%,white)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
            >
              Get tickets ↗
            </a>
          )}

          <Link
            href="/events"
            className="inline-block font-mono text-mono-label uppercase text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-gold motion-reduce:transition-none"
          >
            ← All events
          </Link>
        </ScrimPool>
      </Container>
    </main>
  );
}
