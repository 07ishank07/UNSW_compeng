import type { ExecMember } from "@/lib/types";

type Props = { member: ExecMember };

const SOCIAL_LABELS: Record<string, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  email: "Email",
  instagram: "Instagram",
  discord: "Discord",
  youtube: "YouTube",
  website: "Website",
  facebook: "Facebook",
};

export default function TeamMemberCard({ member }: Props) {
  return (
    <article className="border border-solder p-6">
      {/* Photo placeholder — swap with next/image + urlForImage in live Sanity mode */}
      <div
        className="w-full aspect-square bg-solder mb-5 flex items-end p-3"
        aria-hidden="true"
      >
        <span className="font-mono text-mono-label text-ghost uppercase tracking-[0.04em]">
          {member.role.toUpperCase().slice(0, 4)}
        </span>
      </div>
      <p className="font-mono text-mono-label uppercase tracking-[0.04em] text-copper mb-1">
        {member.role}
      </p>
      <p className="font-display text-xl text-silk mb-3">{member.name}</p>
      {member.bio && (
        <p className="text-body text-ghost text-sm leading-relaxed mb-4">
          {member.bio}
        </p>
      )}
      {(member.socials ?? []).length > 0 && (
        <ul className="flex flex-wrap gap-3" role="list">
          {(member.socials ?? []).map((s) => (
            <li key={s.platform}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost hover:text-silk transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
              >
                {SOCIAL_LABELS[s.platform] ?? s.platform}
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
