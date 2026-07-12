import type { ExecMember } from "@/lib/types";
import TeamMemberProfile from "@/components/modules/TeamMemberProfile";
import { Reveal } from "@/components/motion/Reveal";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrimPool } from "@/components/ui/ScrimPool";
import CopperSeam from "@/components/ui/CopperSeam";
import { Container } from "@/components/ui/Container";
import { FIELD } from "@/lib/fieldRecipes";
import type { FieldConfig } from "@/components/ui/Section";

type Props = { members: ExecMember[] };

// Fixed portfolio order; members with no portfolio collect into "Committee".
const PORTFOLIOS = [
  "Executive",
  "Technical",
  "Industry",
  "Academic",
  "Socials",
  "Marketing",
] as const;

const PORTFOLIO_META: Record<
  (typeof PORTFOLIOS)[number],
  { accentClass: string; field: FieldConfig }
> = {
  Executive: {
    accentClass: "text-accent-gold",
    field: { ...FIELD.gold, shape: "ripple", opacity: 0.8, seed: 1.7 },
  },
  Technical: {
    accentClass: "text-slate-soft",
    field: { ...FIELD.teal, shape: "warp", opacity: 0.78, seed: 3.4 },
  },
  Industry: {
    accentClass: "text-crimson-soft",
    field: { ...FIELD.crimson, shape: "sphere", opacity: 0.78, seed: 5.1 },
  },
  Academic: {
    accentClass: "text-slate-soft",
    field: { ...FIELD.teal, shape: "simplex", opacity: 0.78, seed: 6.8 },
  },
  Socials: {
    accentClass: "text-purple-soft",
    field: { ...FIELD.purple, shape: "swirl", opacity: 0.78, seed: 8.5 },
  },
  Marketing: {
    accentClass: "text-crimson-soft",
    field: { ...FIELD.crimson, shape: "wave", opacity: 0.78, seed: 10.2 },
  },
};

/**
 * The board — one station per PORTFOLIO (SIGNAL open-colour model): Executive
 * leads as a 2-up featured pair; every other portfolio is a compact 4-up gallery.
 * Each station carries its own field + shape with copper seams between; members
 * with no portfolio close the page as a calm "Committee" band. Profiles
 * batch-reveal per station; list semantics preserved.
 */
export default function TeamGrid({ members }: Props) {
  if (members.length === 0) {
    return (
      <Container className="py-12">
        <ScrimPool className="w-fit px-5 py-4">
          <p className="font-mono text-mono-label text-ink-muted">
            {"// board unpopulated — no exec members found"}
          </p>
        </ScrimPool>
      </Container>
    );
  }

  const nonEmpty = PORTFOLIOS.filter((p) => members.some((m) => m.portfolio === p));
  const committee = members.filter(
    (m) => !m.portfolio || !PORTFOLIOS.includes(m.portfolio as (typeof PORTFOLIOS)[number]),
  );

  return (
    <>
      {nonEmpty.map((portfolio, i) => {
        const meta = PORTFOLIO_META[portfolio];
        const group = members.filter((m) => m.portfolio === portfolio);
        return (
          <div key={portfolio}>
            <CopperSeam />
            <Section
              field={meta.field}
              scrim="none"
              rhythm="band"
              ariaLabelledby={`team-${portfolio}`}
            >
              <ScrimPool className="p-5 sm:p-7">
                <SectionHeading
                  id={`team-${portfolio}`}
                  index={String(i + 1).padStart(2, "0")}
                  title={portfolio}
                  count={`// ${group.length} ${group.length === 1 ? "component" : "components"}`}
                  accentClass={meta.accentClass}
                />
                {/* Exactly TWO figures per row — each profile owns a half-width
                    column so the 4:3 wells use the full measure. */}
                <Reveal stagger role="list" className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
                  {group.map((m) => (
                    <TeamMemberProfile key={m._id} member={m} />
                  ))}
                </Reveal>
              </ScrimPool>
            </Section>
          </div>
        );
      })}

      {committee.length > 0 && (
        <>
          <CopperSeam />
          {/* Calm closing band — no field; the shell itself grounds the tail. */}
          <Section rhythm="band" ariaLabelledby="team-committee">
            <SectionHeading
              id="team-committee"
              index={String(nonEmpty.length + 1).padStart(2, "0")}
              title="Committee"
              count={`// ${committee.length} ${committee.length === 1 ? "component" : "components"}`}
              accentClass="text-ink-muted"
            />
            <Reveal stagger role="list" className="grid gap-x-8 gap-y-14 sm:grid-cols-2">
              {committee.map((m) => (
                <TeamMemberProfile key={m._id} member={m} />
              ))}
            </Reveal>
          </Section>
        </>
      )}
    </>
  );
}
