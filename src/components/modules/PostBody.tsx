import { PortableText } from "@portabletext/react";
import type { PortableTextBlock } from "@/lib/types";

type Props = { body: PortableTextBlock[] | null };

export default function PostBody({ body }: Props) {
  if (!body || body.length === 0) {
    return (
      <p className="font-mono text-mono-label tracking-[0.04em] text-ghost">
        {"// body not available in mock mode"}
      </p>
    );
  }
  return (
    <div className="max-w-2xl">
      <PortableText
        value={body}
        components={{
          block: {
            h2: ({ children }) => (
              <h2 className="font-display text-h2 text-silk mt-10 mb-4">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-display text-xl text-silk mt-8 mb-3">
                {children}
              </h3>
            ),
            normal: ({ children }) => (
              <p className="text-body text-ghost mb-5 leading-relaxed">
                {children}
              </p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-copper pl-5 my-6 text-ghost italic">
                {children}
              </blockquote>
            ),
          },
          marks: {
            strong: ({ children }) => (
              <strong className="font-semibold text-silk">{children}</strong>
            ),
            em: ({ children }) => <em className="italic">{children}</em>,
            code: ({ children }) => (
              <code className="font-mono text-mono-label text-copper bg-solder/30 px-1">
                {children}
              </code>
            ),
            link: ({ value, children }) => (
              <a
                href={value?.href}
                target={value?.blank ? "_blank" : undefined}
                rel={value?.blank ? "noopener noreferrer" : undefined}
                className="text-copper hover:text-copper-bright underline transition-colors"
              >
                {children}
              </a>
            ),
          },
          list: {
            bullet: ({ children }) => (
              <ul className="list-disc list-inside text-ghost space-y-1 mb-5">
                {children}
              </ul>
            ),
            number: ({ children }) => (
              <ol className="list-decimal list-inside text-ghost space-y-1 mb-5">
                {children}
              </ol>
            ),
          },
        }}
      />
    </div>
  );
}
