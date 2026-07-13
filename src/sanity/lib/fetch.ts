import "server-only";
import { client } from "./client";
import type { QueryParams } from "next-sanity";

// Every server-side read goes through here so caching + tagging is consistent.
// Tagged fetches resolve to revalidate:false = fully static at build — the
// shipped architecture is rebuild-on-publish (docs/deployment.md §5.5 option 1).
// The tags are retained so a future on-demand ISR path (option 3) can
// revalidateTag() without touching any call site.
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
