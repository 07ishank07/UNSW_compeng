import { HeroGate } from "@/components/depth/HeroGate";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { PeriodicGlitch } from "@/components/motion/PeriodicGlitch";
import AboutSection from "@/components/modules/AboutSection";
import FollowSection from "@/components/modules/FollowSection";
import RecentEventsSection from "@/components/modules/RecentEventsSection";
import ContactSection from "@/components/modules/ContactSection";
import { getRecentPastEvents, getSiteSettings } from "@/lib/content";

// Fallbacks when the Studio siteSettings doc doesn't (yet) carry these socials.
const INSTAGRAM_FALLBACK = "https://www.instagram.com/unswcompengsoc/";
const DISCORD_FALLBACK = "https://discord.gg/DHFDcaNgSH";

export default async function Home() {
  const [settings, recentEvents] = await Promise.all([
    getSiteSettings(),
    getRecentPastEvents(),
  ]);
  const instagramUrl =
    settings?.socials?.find((s) => s.platform === "instagram")?.url ?? INSTAGRAM_FALLBACK;
  const discordUrl =
    settings?.socials?.find((s) => s.platform === "discord")?.url ?? DISCORD_FALLBACK;

  return (
    <main className="flex-1">
      {/* Hero — full-viewport section with the layered-2D Gate behind the content. */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-end overflow-hidden pb-16">
        {/*
          Decorative canvas: aria-hidden, pointer-events-none keeps it below click targets.
          Pointer events are wired inside Gate.tsx via R3F's onPointerMove (UV space),
          not the DOM — so the canvas wrapper stays aria-hidden without losing the
          cursor-heat probe interaction.
        */}
        <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
          <HeroGate />
        </div>

        {/* Hero content — above the canvas, z-10 so it is always clickable */}
        <div className="relative z-10 flex flex-col items-center gap-8 text-center px-6">
          {/* Society wordmark — Clash Display, weight-morph reveal + soft energized glow. */}
          <SplitHeadline
            as="h1"
            weight={[420, 600]}
            className="js-glitch-text font-display text-display text-silk leading-[1.05] tracking-tight [text-shadow:0_0_14px_color-mix(in_srgb,var(--color-purple)_28%,transparent)]"
          >
            CompEngSoc
          </SplitHeadline>

          {/* Machine-voice sub-label */}
          <p className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost">
            {"// UNSW Computer Engineering Society · est. 2026"}
          </p>

          {/*
            Mandatory CTA — CLAUDE.md non-negotiable.
            href must be exactly this URL; opens in new tab; rel noopener noreferrer.
          */}
          <a
            href="https://www.unsw.edu.au/engineering/study-with-us/study-areas/computer-engineering"
            target="_blank"
            rel="noopener noreferrer"
            className="
              inline-block px-8 py-3 rounded-sm
              bg-gold text-substrate font-body font-semibold text-sm
              hover:bg-[color-mix(in_oklch,var(--color-gold)_85%,white)] lift
              shadow-[0_4px_24px_color-mix(in_oklch,var(--color-gold)_15%,transparent)]
              hover:shadow-[0_4px_24px_color-mix(in_oklch,var(--color-gold)_22%,transparent)]
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold
            "
          >
            Learn more
          </a>
        </div>

        {/* Ambient retro glitch on a randomised timer — punctuates the hero logo
            mark + wordmark alongside the existing energize/reveal glitches. */}
        <PeriodicGlitch />
      </section>

      <AboutSection />
      <RecentEventsSection events={recentEvents} />
      <FollowSection instagramUrl={instagramUrl} discordUrl={discordUrl} />
      <ContactSection settings={settings} />
    </main>
  );
}
