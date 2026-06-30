import { HeroGate } from "@/components/depth/HeroGate";
import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { PeriodicGlitch } from "@/components/motion/PeriodicGlitch";
import AboutSection from "@/components/modules/AboutSection";
import InstagramCta from "@/components/modules/InstagramCta";
import ContactSection from "@/components/modules/ContactSection";
import { getSiteSettings } from "@/lib/content";

// TODO: ensure the Sanity siteSettings doc carries an `instagram` social so this
// stays content-managed; the fallback is the canonical handle.
const INSTAGRAM_FALLBACK = "https://www.instagram.com/unswcompengsoc/";

export default async function Home() {
  const settings = await getSiteSettings();
  const instagramUrl =
    settings?.socials?.find((s) => s.platform === "instagram")?.url ?? INSTAGRAM_FALLBACK;

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
            className="js-glitch-text font-display text-display text-silk leading-[1.05] tracking-tight [text-shadow:0_0_28px_color-mix(in_srgb,var(--color-purple)_55%,transparent),0_0_60px_color-mix(in_srgb,var(--color-purple)_30%,transparent)]"
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
              hover:bg-gold-bright lift
              shadow-[0_0_24px_color-mix(in_srgb,var(--color-gold)_35%,transparent)]
              hover:shadow-[0_0_36px_color-mix(in_srgb,var(--color-gold)_50%,transparent)]
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
      <InstagramCta url={instagramUrl} />
      <ContactSection settings={settings} />
    </main>
  );
}
