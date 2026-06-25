import { groq } from "next-sanity";

// All queries centralised. Each requests only the fields its view renders.
// Status (upcoming/past) for events is computed in the UI from startDateTime,
// so the store never holds a flag that can go stale.

export const upcomingEventsQuery = groq`
  *[_type == "event" && startDateTime >= now()] | order(startDateTime asc){
    _id, title, "slug": slug.current, eventType, startDateTime, endDateTime,
    location, shortDescription, ticketUrl, "image": heroImage
  }`;

export const pastEventsQuery = groq`
  *[_type == "event" && startDateTime < now()] | order(startDateTime desc){
    _id, title, "slug": slug.current, eventType, startDateTime, location, "image": heroImage
  }`;

export const featuredEventsQuery = groq`
  *[_type == "event" && featured == true && startDateTime >= now()]
    | order(startDateTime asc)[0...3]{
      _id, title, "slug": slug.current, eventType, startDateTime, location
    }`;

export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0]{
    _id, title, eventType, startDateTime, endDateTime, location,
    shortDescription, body, ticketUrl, capacity, "image": heroImage
  }`;

export const sponsorsQuery = groq`
  *[_type == "sponsor"] | order(
    select(tier == "platinum" => 0, tier == "gold" => 1, tier == "silver" => 2, 3) asc,
    order asc
  ){ _id, name, tier, "logo": logo, "alt": logo.alt, website, blurb }`;

export const execQuery = groq`
  *[_type == "execMember"] | order(order asc){
    _id, name, role, portfolio, bio, "photo": photo, socials, term
  }`;

export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc){
    _id, title, "slug": slug.current, category, excerpt, publishedAt,
    "author": author->name, "cover": coverImage
  }`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0]{
    title, category, publishedAt, body, "cover": coverImage,
    "author": author->{name, role}, seo
  }`;

export const academicResourcesQuery = groq`
  *[_type == "academicResource"] | order(category asc, order asc){
    _id, title, courseCode, category, externalUrl, "fileUrl": file.asset->url,
    description, "hasBody": defined(body)
  }`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{ tagline, contactEmail, socials, newsletterUrl, defaultSeo }`;
