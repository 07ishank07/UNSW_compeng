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
  image: null;
};

export type PastEvent = {
  _id: string;
  title: string;
  slug: string;
  eventType: EventType;
  startDateTime: string;
  location: string | null;
  image: null;
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
  image: null;
};

export type SponsorTier = "platinum" | "gold" | "silver" | "partner";

export type Sponsor = {
  _id: string;
  name: string;
  tier: SponsorTier;
  logo: null;
  alt: string;
  website: string;
  blurb: string | null;
};

export type SocialLink = {
  platform: string;
  url: string;
};

export type ExecMember = {
  _id: string;
  name: string;
  role: string;
  portfolio: string | null;
  bio: string | null;
  photo: null;
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
  cover: null;
};

export type PostDetail = {
  title: string;
  category: string | null;
  publishedAt: string;
  body: PortableTextBlock[] | null;
  cover: null;
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
