import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@/lib/types";

type Props = { body: PortableTextBlock[] | null };

export default function PostBody({ body }: Props) {
  if (!body || body.length === 0) {
    return (
      <p className="font-mono text-mono-label text-ink-muted">
        {"// body not available in mock mode"}
      </p>
    );
  }
  return (
    <div className="max-w-[65ch]">
      <PortableText
        value={body}
        components={{
          block: {
            h2: ({ children }) => (
              <h2 className="mt-10 mb-4 font-display font-medium text-h2 text-ink">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="mt-8 mb-3 font-display text-h3 text-ink">
                {children}
              </h3>
            ),
            normal: ({ children }) => (
              <p className="mb-5 text-body text-ink-muted">
                {children}
              </p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="my-6 border-l-2 border-accent-slate/60 pl-5 italic text-ink-muted">
                {children}
              </blockquote>
            ),
          },
          marks: {
            strong: ({ children }) => (
              <strong className="font-semibold text-ink">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            code: ({ children }) => (
              <code className="rounded-control bg-surface-2 px-1.5 py-0.5 font-mono text-mono-label text-ink">
                {children}
              </code>
            ),
            link: ({ value, children }) => (
              <a
                href={value?.href}
                target={value?.blank ? "_blank" : undefined}
                rel={value?.blank ? "noopener noreferrer" : undefined}
                className="text-accent-gold underline transition-colors hover:text-[color-mix(in_oklch,var(--color-accent-gold)_82%,white)] motion-reduce:transition-none"
              >
                {children}
              </a>
            ),
          },
          list: {
            bullet: ({ children }) => (
              <ul className="mb-5 list-inside list-disc space-y-1 text-ink-muted">
                {children}
              </ul>
            ),
            number: ({ children }) => (
              <ol className="mb-5 list-inside list-decimal space-y-1 text-ink-muted">
                {children}
              </ol>
            ),
          },
        }}
      />
    </div>
  );
}
