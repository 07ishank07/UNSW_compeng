import { notFound } from "next/navigation";
import { Link } from "next-view-transitions";
import type { Metadata } from "next";
import { getPostBySlug, getPostStaticParams } from "@/lib/content";
import PostBody from "@/components/modules/PostBody";
import PageHeader from "@/components/ui/PageHeader";
import { DuotoneImage } from "@/components/ui/DuotoneImage";
import { Container } from "@/components/ui/Container";
import { ScrimPool } from "@/components/ui/ScrimPool";
import { FIELD } from "@/lib/fieldRecipes";

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
        signal={{ ...FIELD.purple, shape: "warp", opacity: 0.7, seed: 0 }}
      />
      {/* Calm body — the article sits on a content-fitted pool over the shell. */}
      <Container className="py-12">
        <ScrimPool className="max-w-3xl p-6 sm:p-8">
          {post.cover?.asset?._ref && (
            <DuotoneImage
              image={post.cover}
              alt={post.title}
              duotone="slate"
              aspectClass="aspect-[3/2]"
              width={1024}
              sizes="(max-width: 768px) 100vw, 768px"
              className="mb-8"
            />
          )}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <span className="font-mono text-mono-label uppercase text-ink-muted">
              {date}
            </span>
            {authorName && (
              <>
                <span
                  className="font-mono text-mono-label text-ink-muted"
                  aria-hidden="true"
                >
                  ·
                </span>
                <span className="font-mono text-mono-label uppercase text-ink-muted">
                  {authorName}
                </span>
              </>
            )}
          </div>
          <PostBody body={post.body} />
          <Link
            href="/blog"
            className="mt-10 inline-block font-mono text-mono-label uppercase text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-gold motion-reduce:transition-none"
          >
            ← All posts
          </Link>
        </ScrimPool>
      </Container>
    </main>
  );
}
