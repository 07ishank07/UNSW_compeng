import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Single shared client for PUBLISHED content reads.
// useCdn: true  -> fast, cached, free for published docs.
// For draft/preview reads, create a separate client with useCdn:false + token,
// kept strictly server-side.
// stega stays explicitly OFF for published reads (it injects invisible
// characters into strings); studioUrl is inert until a preview mode enables it.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: { enabled: false, studioUrl: "/studio" },
});
