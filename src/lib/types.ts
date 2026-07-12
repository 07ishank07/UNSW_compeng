export type EventType =
  | "social"
  | "workshop"
  | "networking"
  | "cruise"
  | "camp"
  | "hackathon";

export type PortableTextBlock = {
  _type: string;
  _key: string;
  [key: string]: unknown;
};

/**
 * A Sanity image projected for rendering: the asset reference (consumed by
 * urlForImage / @sanity/image-url) plus the metadata a layout needs to avoid
 * CLS — intrinsic `dimensions` for the aspect box and the base64 `lqip` for a
 * blur-up placeholder. A whole `SanityImage | null` field is null when the
 * document carries no image (visuals are deferred — every field is null today
 * until editors upload). Projected by the `<field>{ asset, alt, dimensions,
 * lqip }` shape in src/sanity/lib/queries.ts — keep the two in lockstep.
 */
export type SanityImage = {
  asset: { _ref: string };
  alt: string | null;
  dimensions: { width: number; height: number; aspectRatio: number } | null;
  lqip: string | null;
};

export type UpcomingEvent = {
  _id: string;
  title: string;
  slug: string;
  eventType: EventType;
  startDateTime: string;
  endDateTime: string | null;
  location: string | null;
  shortDescription: string | null;
  ticketUrl: string | null;
  image: SanityImage | null;
};

export type PastEvent = {
  _id: string;
  title: string;
  slug: string;
  eventType: EventType;
  startDateTime: string;
  location: string | null;
  image: SanityImage | null;
};

export type EventDetail = {
  _id: string;
  title: string;
  eventType: EventType;
  startDateTime: string;
  endDateTime: string | null;
  location: string | null;
  shortDescription: string | null;
  body: PortableTextBlock[] | null;
  ticketUrl: string | null;
  capacity: number | null;
  image: SanityImage | null;
};

// Sponsor tiers were removed by design — one equal rail for every sponsor.
export type Sponsor = {
  _id: string;
  name: string;
  logo: SanityImage | null;
  alt: string;
  website: string;
  blurb: string | null;
};

export type SocialLink = {
  platform: string;
  url: string;
};

export type SiteSettings = {
  tagline: string | null;
  contactEmail: string | null;
  socials: SocialLink[] | null;
  newsletterUrl: string | null;
  defaultSeo: {
    metaTitle: string | null;
    metaDescription: string | null;
    ogImage: null;
  } | null;
};

export type ExecMember = {
  _id: string;
  name: string;
  role: string;
  portfolio: string | null;
  bio: string | null;
  photo: SanityImage | null;
  socials: SocialLink[] | null;
  term: number;
};

export type Post = {
  _id: string;
  title: string;
  slug: string;
  category: string | null;
  excerpt: string | null;
  publishedAt: string;
  author: string | null;
  cover: SanityImage | null;
};

export type PostDetail = {
  title: string;
  category: string | null;
  publishedAt: string;
  body: PortableTextBlock[] | null;
  cover: SanityImage | null;
  author: string | { name: string; role: string } | null;
  seo: null;
};

export type ResourceCategory =
  | "wiki"
  | "notes"
  | "cheatsheet"
  | "pcb"
  | "latex"
  | "video";

export type AcademicResource = {
  _id: string;
  title: string;
  courseCode: string | null;
  category: ResourceCategory;
  externalUrl: string | null;
  fileUrl: string | null;
  description: string | null;
  hasBody: boolean;
};
