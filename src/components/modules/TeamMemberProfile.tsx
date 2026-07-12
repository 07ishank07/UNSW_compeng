import type { ExecMember } from "@/lib/types";
import { DuotoneImage } from "@/components/ui/DuotoneImage";

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

/**
 * Exec profile — editorial gallery figure, DE-CARDED (photo well + caption
 * stack, whitespace does the grouping). Every profile is the WIDE treatment:
 * portfolio grids run exactly two across, so each figure owns a half-container
 * column — the 4:3 duotone well fills that width edge to edge, the name reads
 * at title-card scale, and the bio gets a real measure. Until a photo lands
 * (member.photo is null today) DuotoneImage holds the same aspect box with the
 * role-initials placeholder, so nothing reflows later.
 */
export default function TeamMemberProfile({ member }: Props) {
  return (
    <article role="listitem">
      <DuotoneImage
        image={member.photo}
        alt={member.name}
        duotone="purple"
        aspectClass="aspect-[4/3]"
        width={720}
        sizes="(max-width: 640px) 100vw, 560px"
        placeholder={
          <span className="font-mono text-mono-label uppercase text-ink-muted">
            {member.role.toUpperCase().slice(0, 4)}
          </span>
        }
      />
      <p className="mt-5 font-display text-title-card text-ink">{member.name}</p>
      <p className="mt-1 font-mono text-mono-label uppercase text-purple-soft">{member.role}</p>
      {member.bio && (
        <p className="mt-3 max-w-[52ch] text-pretty text-body text-ink-muted line-clamp-3">
          {member.bio}
        </p>
      )}
      {(member.socials ?? []).length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-3" role="list">
          {(member.socials ?? []).map((s) => (
            <li key={s.platform}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-mono-label uppercase text-ink-muted transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold motion-reduce:transition-none"
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
