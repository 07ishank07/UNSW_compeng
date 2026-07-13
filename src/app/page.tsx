import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { ScrambleLabel } from "@/components/motion/ScrambleLabel";
import { ParallaxLayers } from "@/components/motion/ParallaxLayers";
import { SectionField } from "@/components/depth/SectionField";
import { HeroLogo } from "@/components/depth/HeroLogo";
import { Container } from "@/components/ui/Container";
import TickerBand from "@/components/ui/TickerBand";
import CopperSeam from "@/components/ui/CopperSeam";
import AboutSection from "@/components/modules/AboutSection";
import UpcomingEventsSection from "@/components/modules/UpcomingEventsSection";
import ContactSection from "@/components/modules/ContactSection";
import { FIELD } from "@/lib/fieldRecipes";
import { tokens } from "@/lib/design-tokens";
import { getHomeEvents, getSiteSettings } from "@/lib/content";

// Fallbacks when the Studio siteSettings doc doesn't (yet) carry these socials.
const INSTAGRAM_FALLBACK = "https://www.instagram.com/unswcompengsoc/";
const DISCORD_FALLBACK = "https://discord.gg/DHFDcaNgSH";

const TICKER_ITEMS = [
  "FPGA workshops",
  "PCB design",
  "Embedded systems",
  "Peer tutoring",
  "Industry nights",
  "Hardware socials",
] as const;

export default async function Home() {
  const [settings, homeEvents] = await Promise.all([
    getSiteSettings(),
    getHomeEvents(),
  ]);
  const instagramUrl =
    settings?.socials?.find((s) => s.platform === "instagram")?.url ?? INSTAGRAM_FALLBACK;
  const discordUrl =
    settings?.socials?.find((s) => s.platform === "discord")?.url ?? DISCORD_FALLBACK;

  return (
    <main className="flex-1">
      {/* Hero — a centred composition over the royal-purple ripple: the large
          CompEng mark leads (its cursor pixel effect lives in HeroLogo — no
          mouse-follow tilt anywhere), thesis + CTAs beneath on a tight pool. */}
      <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
        <SectionField {...FIELD.purple} shape="ripple" opacity={0.82} seed={0} />
        <Container>
          <ParallaxLayers
            start="top top"
            end="bottom top"
            className="mx-auto flex max-w-3xl flex-col items-center text-center"
          >
            <div data-drift="4" className="flex flex-col items-center gap-5 px-6 pb-6 pt-14 sm:pt-16">
              {/* The mark floats on the OPEN purple field (no scrim — it's opaque
                  and legible on any ground); only the text gets a scrim pool. The
                  top padding spends the space the one-line monogram freed, sitting
                  the logo slightly lower = optically centred. */}
              <HeroLogo />

              <div className="relative isolate flex flex-col items-center gap-4 px-7 py-6">
                <div aria-hidden="true" className="scrim absolute inset-0 -z-10" />

                <p className="font-mono text-mono-label uppercase text-purple-soft">
                  <ScrambleLabel text="// UNSW COMPUTER ENGINEERING · EST 2026" />
                </p>

                {/* The society monogram — ONE line (no spaces, can't wrap), sized
                    so the whole hero (logo → CTAs) fits one viewport on open. */}
                <SplitHeadline
                  as="h1"
                  dramatic
                  className="font-display font-semibold text-h1-page tracking-tight text-ink"
                >
                  COMPENGSOC
                </SplitHeadline>

                <p className="max-w-[52ch] text-pretty text-body text-ink-muted">
                  Workshops, peer tutoring, and real hardware — for every UNSW Computer
                  Engineering student.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4">
                  <a
                    href={discordUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-control bg-accent-gold px-7 py-3 font-body text-sm font-semibold text-ink-inverse shadow-ambient lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
                  >
                    Join us
                  </a>
                  {/*
                    Mandatory CTA — CLAUDE.md non-negotiable. href EXACTLY this URL;
                    new tab; rel noopener noreferrer.
                  */}
                  <a
                    href="https://www.unsw.edu.au/engineering/study-with-us/study-areas/computer-engineering"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-control border border-hairline px-7 py-3 font-body text-sm font-medium text-ink lift hover:border-hairline-gold hover:text-accent-gold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
                  >
                    Learn more ↗
                  </a>
                </div>
              </div>
            </div>
          </ParallaxLayers>
        </Container>
      </section>

      {/* Ticker station — the 21stdev "pixelated simplex" look verbatim: gold
          noise mostly covering a graphite ground, the marquee riding on top. */}
      <div className="relative isolate overflow-hidden">
        <SectionField
          shape="simplex"
          back={tokens.baseDeep}
          front={tokens.accentGold}
          opacity={0.9}
          seed={1.1}
        />
        <TickerBand items={TICKER_ITEMS} />
      </div>

      {/* Colour stations — each section's field runs EDGE TO EDGE (no opaque
          veils; text sits on content-fitted pools inside each module). Journey:
          purple → gold-on-graphite → teal → crimson → gold → purple, with
          copper seams carrying the signal between stations. */}
      <div className="relative isolate overflow-hidden">
        <SectionField {...FIELD.teal} shape="warp" opacity={0.8} seed={1.7} />
        <AboutSection />
      </div>

      <CopperSeam />

      <div className="relative isolate overflow-hidden">
        <SectionField {...FIELD.crimson} shape="wave" opacity={0.8} seed={3.4} />
        <UpcomingEventsSection events={homeEvents} />
      </div>

      <CopperSeam />

      {/* Merged closing station — Get in touch + the follow glyphs on the one
          purple spiral. */}
      <div className="relative isolate overflow-hidden">
        <SectionField {...FIELD.purple} shape="swirl" opacity={0.8} seed={6.8} />
        <ContactSection settings={settings} instagramUrl={instagramUrl} discordUrl={discordUrl} />
      </div>
    </main>
  );
}
