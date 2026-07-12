import Image from "next/image";
import type { ReactNode } from "react";
import { urlForImage } from "@/sanity/lib/image";
import type { SanityImage } from "@/lib/types";

type Duotone = "purple" | "crimson" | "slate" | "none";

type Props = {
  image: SanityImage | null;
  /** Fallback alt when the asset has none; image.alt wins when present. */
  alt: string;
  /** Tailwind aspect utility, e.g. "aspect-[4/3]" or "aspect-square". */
  aspectClass?: string;
  duotone?: Duotone;
  sizes?: string;
  /** Sanity CDN width served — next.config sets images.unoptimized, so this is
   *  the width actually delivered (never a full-res original). */
  width?: number;
  className?: string;
  /** Shown inside the well when there is no image (role initials, a label…). */
  placeholder?: ReactNode;
};

/**
 * DuotoneImage — the one image-or-placeholder well shared by portraits, event
 * posters and post covers (docs/design-language.md makeover §E). It ALWAYS
 * reserves the same aspect box, so the typographic placeholder shown today and
 * a real Sanity asset later occupy identical space — zero layout shift when
 * editors upload (visuals are deferred; every image field is null for now).
 *
 * Responsibility: markup + Sanity URL building only — no data fetching (the
 * image arrives as a prop). The duotone is a STATIC filter class from
 * DuotoneDefs, never animated (.claude/rules/motion-canvas.md). MUST NOT import
 * Sanity queries or content modules.
 */
export function DuotoneImage({
  image,
  alt,
  aspectClass = "aspect-[4/3]",
  duotone = "purple",
  sizes = "(max-width: 640px) 100vw, 33vw",
  width = 640,
  className = "",
  placeholder,
}: Props) {
  // No asset yet → the placeholder well. Same aspect box + rounding + hairline
  // as the real image so a later upload causes no reflow. Decorative: the well
  // is aria-hidden (any placeholder text is decorative; the real label sits in
  // sibling markup).
  if (!image?.asset?._ref) {
    return (
      <div
        aria-hidden="true"
        className={`flex items-end overflow-hidden rounded-control bg-base-2 p-3 ring-1 ring-hairline ${aspectClass} ${className}`}
      >
        {placeholder}
      </div>
    );
  }

  const src = urlForImage(image).width(width).quality(80).url();
  const duotoneClass = duotone === "none" ? "" : `duotone-${duotone}`;

  return (
    <div
      className={`relative overflow-hidden rounded-control ring-1 ring-hairline ${aspectClass} ${className}`}
    >
      <Image
        src={src}
        alt={image.alt ?? alt}
        fill
        sizes={sizes}
        placeholder={image.lqip ? "blur" : "empty"}
        blurDataURL={image.lqip ?? undefined}
        className={`object-cover ${duotoneClass}`}
      />
    </div>
  );
}
