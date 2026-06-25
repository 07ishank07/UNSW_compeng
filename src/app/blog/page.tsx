import type { Metadata } from "next";
import { getPosts } from "@/lib/content";
import PostsList from "@/components/modules/PostsList";
import PageHeader from "@/components/ui/PageHeader";

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
      />
      <PostsList posts={posts} />
    </main>
  );
}
