import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import type { Metadata } from "next";
import { getPostBySlug, getPostStaticParams } from "@/lib/content";
import PostBody from "@/components/modules/PostBody";
import PageHeader from "@/components/ui/PageHeader";

export function generateStaticParams() {
  return getPostStaticParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return {};
  return { title: `${post.title} — CompEngSoc` };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const date = new Date(post.publishedAt).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const authorName =
    typeof post.author === "string"
      ? post.author
      : post.author != null && "name" in post.author
        ? post.author.name
        : null;

  return (
    <main>
      <PageHeader
        label={post.category ? `// ${post.category.toUpperCase()}` : "// POST"}
        title={post.title}
      />
      <div className="px-6 py-10 max-w-3xl">
        <div className="flex items-center gap-4 mb-8 flex-wrap">
          <span className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
            {date}
          </span>
          {authorName && (
            <>
              <span
                className="font-mono text-mono-label text-ghost"
                aria-hidden="true"
              >
                ·
              </span>
              <span className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
                {authorName}
              </span>
            </>
          )}
        </div>
        <PostBody body={post.body} />
        <Link
          href="/blog"
          className="inline-block mt-10 font-mono text-mono-label uppercase tracking-[0.04em] text-ghost hover:text-silk transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
        >
          ← All Posts
        </Link>
      </div>
    </main>
  );
}
