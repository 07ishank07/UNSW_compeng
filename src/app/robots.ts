import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
