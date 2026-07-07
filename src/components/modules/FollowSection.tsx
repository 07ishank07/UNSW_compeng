import Image from "next/image";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Follow us — Instagram + Discord as logo-image link cards (grew out of the old
 * InstagramCta; still a styled card, NOT an embedded widget/iframe — an embed
 * pulls a heavy third-party script and breaks the perf budget,
 * docs/checklists.md §2.1). URLs are sourced from siteSettings.socials by the
 * page, falling back to the canonical handles.
 *
 * a11y: each link's accessible name comes from aria-label (the link contains
 * only an image); the logo <Image> is alt="" so the label isn't doubled up.
 */

type Props = { instagramUrl: string; discordUrl: string };

const CARDS = [
  {
    key: "instagram",
    logo: "/logos/instagram.svg",
    name: "Instagram",
    handle: "@unswcompengsoc",
    ariaLabel: "Follow CompEngSoc on Instagram",
  },
  {
    key: "discord",
    logo: "/logos/discord.svg",
    name: "Discord",
    handle: "compengsoc server",
    ariaLabel: "Join the CompEngSoc Discord server",
  },
] as const;

export default function FollowSection({ instagramUrl, discordUrl }: Props) {
  const urls: Record<(typeof CARDS)[number]["key"], string> = {
    instagram: instagramUrl,
    discord: discordUrl,
  };

  return (
    <section className="px-6 py-24 border-t border-solder">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost mb-3">
          {"// social"}
        </p>
        <SplitHeadline as="h2" weight={[400, 560]} className="font-display text-h2 text-silk">
          Follow us
        </SplitHeadline>

        <Reveal className="mt-8 flex flex-col sm:flex-row gap-4">
          {CARDS.map((card) => (
            <a
              key={card.key}
              href={urls[card.key]}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={card.ariaLabel}
              className="group flex flex-1 items-center gap-5 border border-slate/40 hover:border-purple hover:shadow-[0_4px_24px_color-mix(in_oklch,var(--color-purple)_15%,transparent)] p-6 lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              <Image
                src={card.logo}
                alt=""
                width={56}
                height={56}
                className="shrink-0 object-contain"
              />
              <span aria-hidden="true" className="flex flex-col gap-1">
                <span className="font-display text-xl text-silk">{card.name}</span>
                <span className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost group-hover:text-silk transition-colors">
                  {card.handle} ↗
                </span>
              </span>
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
