import type { AcademicResource, ResourceCategory } from "@/lib/types";
import AcademicCell from "@/components/modules/AcademicCell";

type Props = { resources: AcademicResource[] };

const CATEGORIES: ResourceCategory[] = [
  "wiki",
  "notes",
  "cheatsheet",
  "pcb",
  "latex",
  "video",
];

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  wiki: "Wiki",
  notes: "Course Notes",
  cheatsheet: "Cheat Sheets",
  pcb: "PCB Design",
  latex: "LaTeX Guides",
  video: "Videos",
};

const CATEGORY_ACCENT: Record<ResourceCategory, string> = {
  wiki: "text-signal",
  notes: "text-copper",
  cheatsheet: "text-copper-bright",
  pcb: "text-gold",
  latex: "text-ghost",
  video: "text-ghost",
};

export default function AcademicsGrid({ resources }: Props) {
  if (resources.length === 0) {
    return (
      <div className="px-6 py-10">
        <p className="font-mono text-mono-label tracking-[0.04em] text-ghost">
          {"// memory map empty — no resources loaded"}
        </p>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 space-y-12">
      {CATEGORIES.map((cat) => {
        const group = resources.filter((r) => r.category === cat);
        if (group.length === 0) return null;
        return (
          <section key={cat}>
            <h2
              className={`font-mono text-mono-label uppercase tracking-[0.04em] mb-4 ${CATEGORY_ACCENT[cat]}`}
            >
              {CATEGORY_LABELS[cat]}
            </h2>
            <ul
              className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
              role="list"
            >
              {group.map((r) => (
                <li key={r._id}>
                  <AcademicCell resource={r} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
