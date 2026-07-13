import { groq } from "next-sanity";

// All queries centralised. Each requests only the fields its view renders.
// Status (upcoming/past) for events is computed in the UI from startDateTime,
// so the store never holds a flag that can go stale.

// Shared image projection — the asset ref (for urlForImage / @sanity/image-url)
// plus the metadata a layout needs for CLS-free rendering: intrinsic dimensions
// for the aspect box and the base64 `lqip` for a blur-up placeholder. Defined
// once so every image field returns the identical SanityImage shape
// (src/lib/types.ts — keep the two in lockstep). A static fragment, not user
// input, so interpolating it into the groq templates below is safe.
const image = `{ "alt": alt, "lqip": asset->metadata.lqip, "dimensions": asset->metadata.dimensions{ width, height, aspectRatio }, asset }`;

export const upcomingEventsQuery = groq`
  *[_type == "event" && startDateTime >= now()] | order(startDateTime asc){
    _id, title, "slug": slug.current, eventType, startDateTime, endDateTime,
    location, shortDescription, ticketUrl, "image": heroImage${image}
  }`;

export const pastEventsQuery = groq`
  *[_type == "event" && startDateTime < now()] | order(startDateTime desc){
    _id, title, "slug": slug.current, eventType, startDateTime, location, "image": heroImage${image}
  }`;

// Home "Upcoming events" strip — one round trip: up to 3 soonest upcoming plus
// up to 3 most-recent past for backfill; the getter merges and caps at 3. Both
// arms project the PastEvent shape (the subset both card states render).
export const homeEventsQuery = groq`{
  "upcoming": *[_type == "event" && startDateTime >= now()] | order(startDateTime asc)[0...3]{
    _id, title, "slug": slug.current, eventType, startDateTime, location, "image": heroImage${image}
  },
  "recent": *[_type == "event" && startDateTime < now()] | order(startDateTime desc)[0...3]{
    _id, title, "slug": slug.current, eventType, startDateTime, location, "image": heroImage${image}
  }
}`;

export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0]{
    _id, title, eventType, startDateTime, endDateTime, location,
    shortDescription, body, ticketUrl, capacity, "image": heroImage${image}
  }`;

// Slugs for generateStaticParams + the sitemap — live builds prerender every
// detail page (static assets are free/unmetered on Workers; SSR is not).
export const eventSlugsQuery = groq`*[_type == "event" && defined(slug.current)].slug.current`;
export const postSlugsQuery = groq`*[_type == "post" && defined(slug.current)].slug.current`;

// Tiers removed — one equal rail, ranked only by the manual `order` field.
export const sponsorsQuery = groq`
  *[_type == "sponsor"] | order(order asc){
    _id, name, "logo": logo${image}, "alt": logo.alt, website, blurb
  }`;

export const execQuery = groq`
  *[_type == "execMember"] | order(order asc){
    _id, name, role, portfolio, bio, "photo": photo${image}, socials, term
  }`;

export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc){
    _id, title, "slug": slug.current, category, excerpt, publishedAt,
    "author": author->name, "cover": coverImage${image}
  }`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0]{
    title, category, publishedAt, body, "cover": coverImage${image},
    "author": author->{name, role}, seo
  }`;

export const academicResourcesQuery = groq`
  *[_type == "academicResource"] | order(category asc, order asc){
    _id, title, courseCode, category, externalUrl, "fileUrl": file.asset->url,
    description, "hasBody": defined(body)
  }`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{ tagline, contactEmail, socials, newsletterUrl, defaultSeo }`;
