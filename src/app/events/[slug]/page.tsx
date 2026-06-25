import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getEventBySlug, getEventStaticParams } from "@/lib/content";
import PageHeader from "@/components/ui/PageHeader";

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
      />
      <div className="px-6 py-10 max-w-3xl space-y-8">
        <dl className="grid grid-cols-[max-content_1fr] gap-x-8 gap-y-3">
          <dt className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
            Date
          </dt>
          <dd className="font-mono text-mono-label text-silk">{date}</dd>
          <dt className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
            Time
          </dt>
          <dd className="font-mono text-mono-label text-silk">{time}</dd>
          {event.location && (
            <>
              <dt className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
                Location
              </dt>
              <dd className="font-mono text-mono-label text-silk">
                {event.location}
              </dd>
            </>
          )}
          {event.capacity && (
            <>
              <dt className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
                Capacity
              </dt>
              <dd className="font-mono text-mono-label text-silk">
                {event.capacity}
              </dd>
            </>
          )}
        </dl>

        {event.shortDescription && (
          <p className="text-body text-ghost">{event.shortDescription}</p>
        )}

        {!event.body && (
          <p className="font-mono text-mono-label tracking-[0.04em] text-ghost">
            // full details published closer to the date
          </p>
        )}

        {event.ticketUrl && (
          <a
            href={event.ticketUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border border-gold text-gold font-mono text-mono-label uppercase tracking-[0.04em] px-6 py-3 hover:bg-gold hover:text-substrate transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
          >
            Get Tickets ↗
          </a>
        )}

        <Link
          href="/events"
          className="inline-block font-mono text-mono-label uppercase tracking-[0.04em] text-ghost hover:text-silk transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          ← All Events
        </Link>
      </div>
    </main>
  );
}
