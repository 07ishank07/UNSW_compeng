import "server-only";
import { client } from "./client";
import type { QueryParams } from "next-sanity";

// Every server-side read goes through here so caching + tagging is consistent.
// `tags` let the /api/revalidate webhook surgically invalidate only what changed.
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  revalidate = 60,
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {
      revalidate: tags ? false : revalidate,
      tags,
    },
  });
}
