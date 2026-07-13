import type { MetadataRoute } from "next";
import { getEventStaticParams, getPostStaticParams } from "@/lib/content";

// Canonical origin from NEXT_PUBLIC_SITE_URL (CI env + wrangler vars in prod);
// localhost fallback keeps dev builds working.
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [events, posts] = await Promise.all([
    getEventStaticParams(),
    getPostStaticParams(),
  ]);
  const now = new Date();
  return [
    ...["", "/events", "/sponsors", "/team", "/academics", "/blog"].map((path) => ({
      url: `${BASE}${path}`,
      lastModified: now,
    })),
    ...events.map(({ slug }) => ({ url: `${BASE}/events/${slug}`, lastModified: now })),
    ...posts.map(({ slug }) => ({ url: `${BASE}/blog/${slug}`, lastModified: now })),
  ];
}
