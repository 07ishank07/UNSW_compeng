import type { AcademicResource } from "@/lib/types";

type Props = { resource: AcademicResource };

export default function AcademicCell({ resource }: Props) {
  const href = resource.externalUrl ?? resource.fileUrl;
  const isExternal = !!href;

  const inner = (
    <>
      {resource.courseCode && (
        <p className="font-mono text-mono-label uppercase tracking-[0.04em] text-copper mb-1">
          {resource.courseCode}
        </p>
      )}
      <p className="font-display text-lg text-silk mb-2">{resource.title}</p>
      {resource.description && (
        <p className="font-mono text-mono-label text-ghost leading-relaxed">
          {resource.description}
        </p>
      )}
      {isExternal && (
        <span className="inline-block mt-3 font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
          Open ↗
        </span>
      )}
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="block border border-solder hover:border-copper p-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
      >
        {inner}
      </a>
    );
  }

  return <div className="border border-solder p-4">{inner}</div>;
}
