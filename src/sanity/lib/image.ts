import { createImageUrlBuilder } from "@sanity/image-url";
import { dataset, projectId } from "../env";

const builder = createImageUrlBuilder({ projectId, dataset });

// Always call .width()/.height()/.quality() at the call site so we never ship a
// full-resolution original. next.config sets images.unoptimized, so Sanity's CDN
// (not Next) does the resizing — the width you pass here is the width served.
// Example: urlForImage(logo).width(240).quality(80).url()
// The param type is derived from the builder so our projected SanityImage
// ({ asset: { _ref }, … }) is accepted without a fragile deep type import.
export function urlForImage(source: Parameters<typeof builder.image>[0]) {
  return builder.image(source).auto("format").fit("max");
}
