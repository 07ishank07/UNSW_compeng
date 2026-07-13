import { mockUpcomingEvents, mockPastEvents } from "@/data/mocks/events";
import { mockSponsors } from "@/data/mocks/sponsors";
import { mockExec } from "@/data/mocks/exec";
import { mockPosts } from "@/data/mocks/posts";
import { mockAcademicResources } from "@/data/mocks/academicResources";
import { mockSiteSettings } from "@/data/mocks/siteSettings";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  upcomingEventsQuery,
  pastEventsQuery,
  homeEventsQuery,
  eventBySlugQuery,
  eventSlugsQuery,
  sponsorsQuery,
  execQuery,
  postsQuery,
  postBySlugQuery,
  postSlugsQuery,
  academicResourcesQuery,
  siteSettingsQuery,
} from "@/sanity/lib/queries";
import type {
  AcademicResource,
  EventDetail,
  EventType,
  ExecMember,
  PastEvent,
  Post,
  PostDetail,
  SiteSettings,
  Sponsor,
  UpcomingEvent,
} from "@/lib/types";

const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export async function getUpcomingEvents(): Promise<UpcomingEvent[]> {
  if (USE_MOCKS) return mockUpcomingEvents as UpcomingEvent[];
  return sanityFetch<UpcomingEvent[]>({ query: upcomingEventsQuery, tags: ["event"] });
}

export async function getPastEvents(): Promise<PastEvent[]> {
  if (USE_MOCKS) return mockPastEvents as PastEvent[];
  return sanityFetch<PastEvent[]>({ query: pastEventsQuery, tags: ["event"] });
}

// Home "Upcoming events" strip: up to 3 — soonest upcoming first, backfilled
// with the most recent past events. Returns the PastEvent shape; the section
// derives each card's Upcoming/Recent status from startDateTime at render.
// The whole site is static, so GROQ now() and the render clock freeze at
// build — the daily scheduled rebuild (deploy.yml cron) keeps the split honest.
export async function getHomeEvents(): Promise<PastEvent[]> {
  if (USE_MOCKS) {
    // Date-filter BOTH mock arrays at call time (not array membership) so the
    // backfill path keeps working as mock dates age, exactly like live GROQ.
    // Numeric epoch sorts — mock ISO strings mix +10:00/+11:00 offsets, so
    // string order is not chronological order.
    const now = Date.now();
    const all = [...mockUpcomingEvents, ...mockPastEvents] as PastEvent[];
    const upcoming = all
      .filter((e) => Date.parse(e.startDateTime) >= now)
      .sort((a, b) => Date.parse(a.startDateTime) - Date.parse(b.startDateTime));
    const recent = all
      .filter((e) => Date.parse(e.startDateTime) < now)
      .sort((a, b) => Date.parse(b.startDateTime) - Date.parse(a.startDateTime));
    return [...upcoming, ...recent].slice(0, 3);
  }
  const { upcoming, recent } = await sanityFetch<{
    upcoming: PastEvent[];
    recent: PastEvent[];
  }>({ query: homeEventsQuery, tags: ["event"] });
  return [...(upcoming ?? []), ...(recent ?? [])].slice(0, 3);
}

export async function getEventBySlug(slug: string): Promise<EventDetail | null> {
  if (USE_MOCKS) {
    const all = [
      ...mockUpcomingEvents,
      ...mockPastEvents,
    ] as (UpcomingEvent | PastEvent)[];
    const found = all.find((e) => e.slug === slug);
    if (!found) return null;
    return {
      _id: found._id,
      title: found.title,
      eventType: found.eventType as EventType,
      startDateTime: found.startDateTime,
      endDateTime: "endDateTime" in found ? (found.endDateTime ?? null) : null,
      location: found.location ?? null,
      shortDescription:
        "shortDescription" in found ? (found.shortDescription ?? null) : null,
      body: null,
      ticketUrl: "ticketUrl" in found ? (found.ticketUrl ?? null) : null,
      capacity: null,
      image: null,
    };
  }
  return sanityFetch<EventDetail | null>({
    query: eventBySlugQuery,
    params: { slug },
    tags: ["event"],
  });
}

export async function getEventStaticParams(): Promise<Array<{ slug: string }>> {
  if (USE_MOCKS) {
    return [...mockUpcomingEvents, ...mockPastEvents].map((e) => ({
      slug: e.slug,
    }));
  }
  const slugs = await sanityFetch<string[]>({ query: eventSlugsQuery, tags: ["event"] });
  return (slugs ?? []).map((slug) => ({ slug }));
}

export async function getSponsors(): Promise<Sponsor[]> {
  if (USE_MOCKS) return mockSponsors as Sponsor[];
  return sanityFetch<Sponsor[]>({ query: sponsorsQuery, tags: ["sponsor"] });
}

export async function getExec(): Promise<ExecMember[]> {
  if (USE_MOCKS) return mockExec as ExecMember[];
  return sanityFetch<ExecMember[]>({ query: execQuery, tags: ["execMember"] });
}

export async function getPosts(): Promise<Post[]> {
  if (USE_MOCKS) return mockPosts as Post[];
  return sanityFetch<Post[]>({ query: postsQuery, tags: ["post"] });
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
  if (USE_MOCKS) {
    const found = mockPosts.find((p) => p.slug === slug);
    if (!found) return null;
    return {
      title: found.title,
      category: found.category,
      publishedAt: found.publishedAt,
      body: null,
      cover: null,
      author: found.author,
      seo: null,
    };
  }
  return sanityFetch<PostDetail | null>({
    query: postBySlugQuery,
    params: { slug },
    tags: ["post"],
  });
}

export async function getPostStaticParams(): Promise<Array<{ slug: string }>> {
  if (USE_MOCKS) return mockPosts.map((p) => ({ slug: p.slug }));
  const slugs = await sanityFetch<string[]>({ query: postSlugsQuery, tags: ["post"] });
  return (slugs ?? []).map((slug) => ({ slug }));
}

export async function getAcademicResources(): Promise<AcademicResource[]> {
  if (USE_MOCKS) return mockAcademicResources as AcademicResource[];
  return sanityFetch<AcademicResource[]>({
    query: academicResourcesQuery,
    tags: ["academicResource"],
  });
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  if (USE_MOCKS) return mockSiteSettings as SiteSettings;
  return sanityFetch<SiteSettings | null>({
    query: siteSettingsQuery,
    tags: ["siteSettings"],
  });
}
