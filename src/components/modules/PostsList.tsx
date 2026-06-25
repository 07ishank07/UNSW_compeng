import type { Post } from "@/lib/types";
import PostCard from "@/components/modules/PostCard";

type Props = { posts: Post[] };

export default function PostsList({ posts }: Props) {
  if (posts.length === 0) {
    return (
      <div className="px-6 py-10">
        <p className="font-mono text-mono-label tracking-[0.04em] text-ghost">
          // signal idle — changelog empty
        </p>
      </div>
    );
  }
  return (
    <div className="px-6 py-4">
      <ul role="list">
        {posts.map((p) => (
          <li key={p._id}>
            <PostCard post={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
