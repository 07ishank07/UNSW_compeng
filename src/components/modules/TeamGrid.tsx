import type { ExecMember } from "@/lib/types";
import TeamMemberCard from "@/components/modules/TeamMemberCard";

type Props = { members: ExecMember[] };

export default function TeamGrid({ members }: Props) {
  if (members.length === 0) {
    return (
      <div className="px-6 py-10">
        <p className="font-mono text-mono-label tracking-[0.04em] text-ghost">
          {"// board unpopulated — no exec members found"}
        </p>
      </div>
    );
  }
  return (
    <div className="px-6 py-10">
      <ul
        className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
      >
        {members.map((m) => (
          <li key={m._id}>
            <TeamMemberCard member={m} />
          </li>
        ))}
      </ul>
    </div>
  );
}
