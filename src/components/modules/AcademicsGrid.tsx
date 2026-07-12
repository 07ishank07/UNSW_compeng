import type { AcademicResource, ResourceCategory } from "@/lib/types";
import AcademicRow from "@/components/modules/AcademicRow";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrimPool } from "@/components/ui/ScrimPool";
import CopperSeam from "@/components/ui/CopperSeam";
import { Container } from "@/components/ui/Container";
import { FIELD } from "@/lib/fieldRecipes";
import type { FieldConfig } from "@/components/ui/Section";

type Props = { resources: AcademicResource[] };

const CATEGORIES: ResourceCategory[] = ["wiki", "notes", "cheatsheet", "pcb", "latex", "video"];

// Each category is its own station: distinct shape, rotated hue (adjacent
// sections never share either), single-column datasheet rows on a fitted pool.
const CATEGORY_META: Record<
  ResourceCategory,
  { label: string; accentClass: string; field: FieldConfig }
> = {
  wiki: {
    label: "Wiki",
    accentClass: "text-purple-soft",
    field: { ...FIELD.purple, shape: "ripple", opacity: 0.78, seed: 1.7 },
  },
  notes: {
    label: "Course Notes",
    accentClass: "text-slate-soft",
    field: { ...FIELD.teal, shape: "wave", opacity: 0.78, seed: 3.4 },
  },
  cheatsheet: {
    label: "Cheat Sheets",
    accentClass: "text-accent-gold",
    field: { ...FIELD.gold, shape: "dots", opacity: 0.78, seed: 5.1 },
  },
  pcb: {
    label: "PCB Design",
    accentClass: "text-crimson-soft",
    field: { ...FIELD.crimson, shape: "warp", opacity: 0.78, seed: 6.8 },
  },
  latex: {
    label: "LaTeX Guides",
    accentClass: "text-purple-soft",
    field: { ...FIELD.purple, shape: "swirl", opacity: 0.78, seed: 8.5 },
  },
  video: {
    label: "Videos",
    accentClass: "text-slate-soft",
    field: { ...FIELD.teal, shape: "sphere", opacity: 0.78, seed: 10.2 },
  },
};

/**
 * Memory map — one station per category (SIGNAL open-colour model): each
 * non-empty category gets its own field + shape, a display heading, and a
 * single-column list of datasheet rows on a content-fitted pool (the old
 * two-column auto-fit drifted its hairlines). Copper seams carry the bus
 * between categories.
 */
export default function AcademicsGrid({ resources }: Props) {
  if (resources.length === 0) {
    return (
      <Container className="py-12">
        <ScrimPool className="w-fit px-5 py-4">
          <p className="font-mono text-mono-label text-ink-muted">
            {"// memory map empty — no resources loaded"}
          </p>
        </ScrimPool>
      </Container>
    );
  }

  const nonEmpty = CATEGORIES.filter((c) => resources.some((r) => r.category === c));

  return (
    <>
      {nonEmpty.map((cat, i) => {
        const meta = CATEGORY_META[cat];
        const group = resources.filter((r) => r.category === cat);
        return (
          <div key={cat}>
            <CopperSeam />
            <Section field={meta.field} scrim="none" rhythm="band" ariaLabelledby={`acad-${cat}`}>
              <ScrimPool className="p-5 sm:p-7">
                <SectionHeading
                  id={`acad-${cat}`}
                  index={String(i + 1).padStart(2, "0")}
                  title={meta.label}
                  count={`// ${group.length} mapped`}
                  accentClass={meta.accentClass}
                />
                <ul role="list">
                  {group.map((r) => (
                    <li key={r._id}>
                      <AcademicRow resource={r} />
                    </li>
                  ))}
                </ul>
              </ScrimPool>
            </Section>
          </div>
        );
      })}
    </>
  );
}
