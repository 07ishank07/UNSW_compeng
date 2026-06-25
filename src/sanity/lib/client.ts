import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Single shared client for PUBLISHED content reads.
// useCdn: true  -> fast, cached, free for published docs.
// For draft/preview reads, create a separate client with useCdn:false + token,
// kept strictly server-side.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: { studioUrl: "/studio" },
});
