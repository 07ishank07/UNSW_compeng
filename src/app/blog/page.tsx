import type { Metadata } from "next";
import { getPosts } from "@/lib/content";
import BlogExplorer from "@/components/modules/BlogExplorer";
import PageHeader from "@/components/ui/PageHeader";
import { FIELD } from "@/lib/fieldRecipes";

export const metadata: Metadata = {
  title: "Blog — CompEngSoc",
  description:
    "News, recaps, and technical posts from the UNSW Computer Engineering Society.",
};

export default async function BlogPage() {
  const posts = await getPosts();
  return (
    <main>
      <PageHeader
        label="// changelog"
        title="Blog"
        subtitle="Announcements, event recaps, and technical writing from CompEngSoc."
        signal={{ ...FIELD.purple, shape: "warp", opacity: 0.8, seed: 0 }}
      />
      <BlogExplorer posts={posts} />
    </main>
  );
}
