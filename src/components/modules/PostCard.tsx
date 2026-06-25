import Link from "next/link";
import type { Post } from "@/lib/types";

type Props = { post: Post };

const CATEGORY_LABELS: Record<string, string> = {
  announcement: "ANNOUNCEMENT",
  recap: "RECAP",
  technical: "TECHNICAL",
  opportunity: "OPPORTUNITY",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function PostCard({ post }: Props) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block border-b border-solder py-6 hover:border-copper transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
    >
      <div className="flex items-center gap-3 mb-2 flex-wrap">
        <span className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
          {formatDate(post.publishedAt)}
        </span>
        {post.category && (
          <>
            <span
              className="font-mono text-mono-label text-ghost"
              aria-hidden="true"
            >
              ·
            </span>
            <span className="font-mono text-mono-label uppercase tracking-[0.04em] text-copper">
              {CATEGORY_LABELS[post.category] ??
                post.category.toUpperCase()}
            </span>
          </>
        )}
      </div>
      <h3 className="font-display text-xl text-silk group-hover:text-copper-bright transition-colors mb-2">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="text-body text-ghost text-sm leading-relaxed">
          {post.excerpt}
        </p>
      )}
      {post.author && (
        <p className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost mt-3">
          {post.author}
        </p>
      )}
    </Link>
  );
}
