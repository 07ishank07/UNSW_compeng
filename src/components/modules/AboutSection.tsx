import { SplitHeadline } from "@/components/motion/SplitHeadline";
import { Reveal } from "@/components/motion/Reveal";

/**
 * About Us — the full home-page About section (docs/content-map.md §1.2, verbatim
 * copy). Heading via SplitHeadline (kept outside Reveal so the two don't fight over
 * opacity, matching PageHeader); the prose block reveals on scroll.
 */
export default function AboutSection() {
  return (
    <section className="px-6 py-24 border-t border-solder">
      <div className="max-w-3xl mx-auto">
        <p className="font-mono text-mono-label uppercase tracking-[0.04em] text-ghost mb-3">
          {"// about"}
        </p>
        <SplitHeadline as="h2" weight={[400, 560]} className="font-display text-h2 text-silk">
          The home of Computer Engineering at UNSW
        </SplitHeadline>

        <Reveal className="mt-8 space-y-6 text-body text-ghost leading-relaxed">
          <p>
            CompEngSoc is brand new. We were founded in 2026 — the first society at UNSW built
            specifically for <strong className="text-silk font-semibold">Computer Engineering</strong>,
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
          <p className="text-silk">
            We&apos;re early, and that&apos;s the point. The people who join now aren&apos;t joining
            something finished — they&apos;re soldering the first connections of what comes next. Pull
            up a seat at the bench.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
