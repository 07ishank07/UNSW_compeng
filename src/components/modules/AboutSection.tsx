import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Reveal } from "@/components/motion/Reveal";
import { ScrimPool } from "@/components/ui/ScrimPool";
import CpuArchitecture from "@/components/ui/CpuArchitecture";

/**
 * About Us — the full home-page About section (docs/content-map.md §1.2, verbatim
 * copy), in the Rev-3 "open colour" model: the section's warp field runs edge to
 * edge and the heading + prose each sit on their own content-fitted ScrimPool —
 * the veil hugs the text and adapts automatically if the copy changes. (The old
 * board schematic moved out: its traces ran to the SVG edge by design and read
 * as overflow; the copper motif now lives in the CopperSeam bands.)
 *
 * Heading via SplitHeadline (outside Reveal so the two don't fight over
 * opacity); the prose block reveals on scroll.
 */
export default function AboutSection() {
  return (
    <section className="px-6 py-24 lg:py-32">
      <div className="mx-auto grid w-full max-w-6xl items-start gap-10 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <ScrimPool className="inline-flex flex-col p-6 sm:p-8">
            {/* Datasheet index — structural machine voice, not a decorative eyebrow */}
            <div className="mb-4 flex items-center gap-4" aria-hidden="true">
              <span className="font-mono text-mono-label text-slate-soft">01</span>
              <span className="w-10 border-t border-hairline" />
            </div>
            <SplitHeadline
              as="h2"
              dramatic
              gate
              className="text-balance font-display font-medium text-h2 text-ink lg:max-w-[16ch]"
            >
              The home of Computer Engineering at UNSW
            </SplitHeadline>

            {/* Data pulses converging on the CESOC package — draws in when it
                scrolls into view (21st.dev CPU schematic, token-adapted). */}
            <CpuArchitecture className="mt-8 hidden w-full max-w-[380px] lg:block" />
          </ScrimPool>
        </div>

        <ScrimPool className="max-w-[65ch] p-6 sm:p-8 lg:col-span-7">
          <Reveal className="space-y-6 text-body text-ink-muted">
            <p>
              CompEngSoc is brand new. We were founded in 2026 — the first society at UNSW built
              specifically for <strong className="font-semibold text-ink">Computer Engineering</strong>,
              the discipline that lives where silicon meets software. We started this year with a small
              founding cohort and a deliberately large ambition: to become one of the flagship societies
              on campus, the place every Computer Engineering student calls home from their first week to
              their last.
            </p>
            <p>
              We exist to close the distance between the lecture theatre and the lab bench. That means
              hands-on hardware nights, free peer tutoring for the courses that break people, a project
              culture that ships real things — FPGAs, PCBs, embedded systems — and an open line to the
              industry that hires our members. Social events, study support, and serious engineering,
              under one roof.
            </p>
            <p className="text-ink">
              We&apos;re early, and that&apos;s the point. The people who join now aren&apos;t joining
              something finished — they&apos;re soldering the first connections of what comes next. Pull
              up a seat at the bench.
            </p>
          </Reveal>
        </ScrimPool>
      </div>
    </section>
  );
}
