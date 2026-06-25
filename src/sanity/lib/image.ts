import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import { dataset, projectId } from "../env";

const builder = imageUrlBuilder({ projectId, dataset });

// Always call .width()/.height()/.quality() at the call site so we never ship
// a full-resolution original. Example: urlForImage(logo).width(240).quality(80).url()
export function urlForImage(source: Image) {
  return builder.image(source).auto("format").fit("max");
}
