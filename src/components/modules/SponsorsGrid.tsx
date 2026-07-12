import type { Sponsor } from "@/lib/types";
import SponsorTile from "@/components/modules/SponsorTile";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrimPool } from "@/components/ui/ScrimPool";
import CopperSeam from "@/components/ui/CopperSeam";
import { FIELD } from "@/lib/fieldRecipes";

type Props = { sponsors: Sponsor[]; contactEmail: string | null };

/** The logo river only runs with enough sponsors to read as a flow; below this
 *  the calm static grid is the better look (user rule: "if there aren't enough,
 *  avoid it"). */
const RIVER_MIN = 5;

/**
 * Power-delivery network — two stations in the open-colour model (tiers removed
 * by design: every sponsor is an EQUAL well on one rail; ranked tiers read as
 * unappealing to prospective sponsors). Station 1: the network — a flat equal
 * logo grid over a purple dot-matrix. Station 2: "Get on the rail" — the
 * sponsorship CTA over a teal warp. Copper seams carry the bus between them.
 */
export default function SponsorsGrid({ sponsors, contactEmail }: Props) {
  return (
    <>
      <CopperSeam />

      <Section
        field={{ ...FIELD.purple, shape: "dots", opacity: 0.78, seed: 1.7 }}
        scrim="none"
        ariaLabelledby="network-h"
      >
        <ScrimPool className="p-5 sm:p-7">
          <SectionHeading
            id="network-h"
            index="01"
            title="The network"
            count={`// ${sponsors.length} on the rail`}
            accentClass="text-purple-soft"
          />
          {sponsors.length === 0 && (
            <p className="font-mono text-mono-label text-ink-muted">
              {"// rails unpowered — no sponsors on the network"}
            </p>
          )}
        </ScrimPool>

        {sponsors.length >= RIVER_MIN ? (
          /* The logo river — an infinite drift of equal wells (pauses on hover
             and while any tile has focus; static row under reduced motion, where
             the clone hides). Clone row is aria-hidden + untabbable. */
          <div className="marquee relative mt-6 border-y border-hairline bg-base-deep/50 py-6">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-base-deep to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-base-deep to-transparent"
            />
            <div className="marquee-track">
              <div className="flex shrink-0 gap-4 pr-4" role="list">
                {sponsors.map((s) => (
                  <div key={s._id} role="listitem" className="w-56 shrink-0">
                    <SponsorTile sponsor={s} />
                  </div>
                ))}
              </div>
              <div aria-hidden="true" className="flex shrink-0 gap-4 pr-4 motion-reduce:hidden">
                {sponsors.map((s) => (
                  <div key={`clone-${s._id}`} className="w-56 shrink-0">
                    <SponsorTile sponsor={s} tabStop={false} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : sponsors.length > 0 ? (
          <ScrimPool className="mt-2 p-5 sm:p-7">
            <Reveal
              stagger
              role="list"
              className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
            >
              {sponsors.map((s) => (
                <div key={s._id} role="listitem">
                  <SponsorTile sponsor={s} />
                </div>
              ))}
            </Reveal>
          </ScrimPool>
        ) : null}
      </Section>

      <CopperSeam />

      <Section
        field={{ ...FIELD.teal, shape: "warp", opacity: 0.75, seed: 3.4 }}
        scrim="none"
        rhythm="band"
        ariaLabelledby="rail-h"
      >
        <ScrimPool className="max-w-xl p-6 sm:p-8">
          <p className="mb-3 font-mono text-mono-label uppercase text-slate-soft">
            {"// sponsorship"}
          </p>
          <h2 id="rail-h" className="text-balance font-display font-medium text-h2 text-ink">
            Get on the rail
          </h2>
          <p className="mt-4 max-w-[48ch] text-pretty text-body text-ink-muted">
            Back the next generation of computer engineers — workshops, projects, and a direct
            line to the students who build hardware.
          </p>
          <div className="mt-7">
            {contactEmail ? (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-block rounded-control bg-accent-gold px-7 py-3 font-body text-sm font-semibold text-ink-inverse shadow-ambient lift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
              >
                Email us
              </a>
            ) : (
              <p className="font-mono text-mono-label text-ink-muted">
                {"// channels offline — check back soon"}
              </p>
            )}
          </div>
        </ScrimPool>
      </Section>
    </>
  );
}
