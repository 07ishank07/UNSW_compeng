import { Link } from "next-view-transitions";
import { formatDateCompact } from "@/lib/dates";
import type { Post } from "@/lib/types";

type Props = { post: Post };

const CATEGORY_LABELS: Record<string, string> = {
  announcement: "ANNOUNCEMENT",
  recap: "RECAP",
  technical: "TECHNICAL",
  opportunity: "OPPORTUNITY",
};

export default function PostCard({ post }: Props) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block border-b border-hairline py-7 lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-gold"
    >
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <span className="font-mono text-mono-label uppercase text-ink-muted">
          {formatDateCompact(post.publishedAt)}
        </span>
        {post.category && (
          <>
            <span className="font-mono text-mono-label text-ink-muted" aria-hidden="true">
              ·
            </span>
            <span className="font-mono text-mono-label uppercase text-purple-soft">
              {CATEGORY_LABELS[post.category] ??
                post.category.toUpperCase()}
            </span>
          </>
        )}
      </div>
      <h3 className="vf-shift mb-2 font-display text-h3 text-ink line-clamp-2 transition-colors group-hover:text-accent-gold motion-reduce:transition-none">
        {post.title}
      </h3>
      {post.excerpt && (
        <p className="max-w-[70ch] text-pretty text-body text-ink-muted line-clamp-3">
          {post.excerpt}
        </p>
      )}
      {post.author && (
        <p className="mt-3 font-mono text-mono-label uppercase text-ink-muted">
          {post.author}
        </p>
      )}
    </Link>
  );
}
