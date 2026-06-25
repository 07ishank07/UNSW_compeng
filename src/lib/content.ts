import { mockUpcomingEvents, mockPastEvents } from "@/data/mocks/events";
import { mockSponsors } from "@/data/mocks/sponsors";
import { mockExec } from "@/data/mocks/exec";
import { mockPosts } from "@/data/mocks/posts";
import { mockAcademicResources } from "@/data/mocks/academicResources";
import { sanityFetch } from "@/sanity/lib/fetch";
import {
  upcomingEventsQuery,
  pastEventsQuery,
  eventBySlugQuery,
  sponsorsQuery,
  execQuery,
  postsQuery,
  postBySlugQuery,
  academicResourcesQuery,
} from "@/sanity/lib/queries";
import type {
  AcademicResource,
  EventDetail,
  EventType,
  ExecMember,
  PastEvent,
  Post,
  PostDetail,
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

export function getEventStaticParams(): Array<{ slug: string }> {
  if (USE_MOCKS) {
    return [...mockUpcomingEvents, ...mockPastEvents].map((e) => ({
      slug: e.slug,
    }));
  }
  return [];
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

export function getPostStaticParams(): Array<{ slug: string }> {
  if (USE_MOCKS) return mockPosts.map((p) => ({ slug: p.slug }));
  return [];
}

export async function getAcademicResources(): Promise<AcademicResource[]> {
  if (USE_MOCKS) return mockAcademicResources as AcademicResource[];
  return sanityFetch<AcademicResource[]>({
    query: academicResourcesQuery,
    tags: ["academicResource"],
  });
}
