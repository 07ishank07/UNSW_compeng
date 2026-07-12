import type { AcademicResource } from "@/lib/types";

type Props = { resource: AcademicResource };

/**
 * Memory-map row — one datasheet line in the academics list, DE-CARDED
 * (docs/design-language.md §0.2.0 tell #5): mono course-code cell · title (+
 * description line) · Open ↗, hairline rules doing the grouping. The course
 * code is genuine structural data (the address on the memory map), not a
 * decorative eyebrow. Rows without a link render inert, no hover affordance.
 */
export default function AcademicRow({ resource }: Props) {
  const href = resource.externalUrl ?? resource.fileUrl;
  const isExternal = !!href;

  const cells = (
    <>
      <span className="font-mono text-mono-label uppercase text-purple-soft">
        {resource.courseCode ?? "——"}
      </span>
      <span>
        <span className="vf-shift block font-display text-h3 text-ink line-clamp-2">{resource.title}</span>
        {resource.description && (
          <span className="mt-1 block font-mono text-mono-label leading-relaxed text-ink-muted line-clamp-2">
            {resource.description}
          </span>
        )}
      </span>
      {isExternal && (
        <span className="font-mono text-mono-label uppercase text-ink-muted transition-colors group-hover:text-accent-gold motion-reduce:transition-none">
          Open ↗
        </span>
      )}
    </>
  );

  const rowClass =
    "grid grid-cols-[1fr_auto] items-baseline gap-x-5 gap-y-1 border-b border-hairline py-4 sm:grid-cols-[6.5rem_1fr_auto]";

  if (href) {
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className={`group ${rowClass} transition-colors hover:bg-base-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-gold motion-reduce:transition-none`}
      >
        {cells}
      </a>
    );
  }

  return <div className={rowClass}>{cells}</div>;
}
