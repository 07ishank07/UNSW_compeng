"use client";
/**
 * BlogExplorer — the changelog's search + category filter, driving the sectioned
 * open-colour layout. Three modes:
 *   default   — one Section per non-empty category (announcement → recap →
 *               technical → opportunity), each with its OWN pixel field, copper
 *               seams between;
 *   filtered  — a chip selects ONE category's Section (rendered even when empty,
 *               machine-voice line);
 *   searching — the sections collapse to one calm results list with an
 *               aria-live match count.
 * Client-side only (the post volume is tiny); search matches title/excerpt/
 * author case-insensitively via useDeferredValue — no debounce, no URL sync.
 * Chips are real buttons with aria-pressed; focus is never moved on filter.
 */
import { useDeferredValue, useId, useState } from "react";
import type { Post } from "@/lib/types";
import PostCard from "@/components/modules/PostCard";
import { Section } from "@/components/ui/Section";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ScrimPool } from "@/components/ui/ScrimPool";
import CopperSeam from "@/components/ui/CopperSeam";
import { FIELD } from "@/lib/fieldRecipes";
import type { FieldConfig } from "@/components/ui/Section";

type Props = { posts: Post[] };

const CATEGORIES = ["announcement", "recap", "technical", "opportunity"] as const;
type Category = (typeof CATEGORIES)[number];

const CATEGORY_META: Record<
  Category,
  { title: string; chip: string; accentClass: string; field: FieldConfig }
> = {
  announcement: {
    title: "Announcements",
    chip: "Announcements",
    accentClass: "text-accent-gold",
    field: { ...FIELD.gold, shape: "ripple", opacity: 0.8, seed: 1.7 },
  },
  recap: {
    title: "Recaps",
    chip: "Recaps",
    accentClass: "text-crimson-soft",
    field: { ...FIELD.crimson, shape: "wave", opacity: 0.78, seed: 3.4 },
  },
  technical: {
    title: "Technical",
    chip: "Technical",
    accentClass: "text-slate-soft",
    field: { ...FIELD.teal, shape: "simplex", opacity: 0.78, seed: 5.1 },
  },
  opportunity: {
    title: "Opportunities",
    chip: "Opportunities",
    accentClass: "text-purple-soft",
    field: { ...FIELD.purple, shape: "dots", opacity: 0.78, seed: 6.8 },
  },
};

const chipBase =
  "inline-flex min-h-11 items-center rounded-pill border px-4 font-mono text-mono-label uppercase transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold motion-reduce:transition-none";

export default function BlogExplorer({ posts }: Props) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<"all" | Category>("all");
  const deferredQuery = useDeferredValue(query);
  const searchId = useId();

  const q = deferredQuery.trim().toLowerCase();
  const searching = q.length > 0;
  const matches = searching
    ? posts.filter((p) =>
        [p.title, p.excerpt ?? "", p.author ?? ""].some((s) => s.toLowerCase().includes(q)),
      )
    : posts;

  const byCategory = (c: Category) => posts.filter((p) => p.category === c);
  const visibleCats: Category[] =
    cat === "all" ? CATEGORIES.filter((c) => byCategory(c).length > 0) : [cat];

  const rows = (list: Post[]) => (
    <ul role="list">
      {list.map((p) => (
        <li key={p._id}>
          <PostCard post={p} />
        </li>
      ))}
    </ul>
  );

  return (
    <>
      {/* Controls band — calm shell; the sections below carry the colour. */}
      <Section rhythm="band" ariaLabelledby={undefined} as="div">
        <form role="search" className="flex flex-col gap-5" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-2">
            <label
              htmlFor={searchId}
              className="font-mono text-mono-label uppercase text-ink-muted"
            >
              {"// grep changelog"}
            </label>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setQuery("");
              }}
              placeholder="Search posts…"
              className="h-11 max-w-md rounded-control border border-hairline bg-surface px-4 text-body text-ink placeholder:text-ink-muted focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-gold"
            />
          </div>
          <div className="flex flex-wrap gap-3" role="group" aria-label="Filter by category">
            <button
              type="button"
              aria-pressed={cat === "all"}
              onClick={() => setCat("all")}
              className={`${chipBase} ${
                cat === "all"
                  ? "border-accent-gold bg-accent-gold text-ink-inverse"
                  : "border-hairline text-ink-muted hover:border-hairline-gold hover:text-accent-gold"
              }`}
            >
              All · {posts.length}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={cat === c}
                onClick={() => setCat(cat === c ? "all" : c)}
                className={`${chipBase} ${
                  cat === c
                    ? "border-accent-gold bg-accent-gold text-ink-inverse"
                    : "border-hairline text-ink-muted hover:border-hairline-gold hover:text-accent-gold"
                }`}
              >
                {CATEGORY_META[c].chip} · {byCategory(c).length}
              </button>
            ))}
          </div>
        </form>
      </Section>

      {searching ? (
        /* Search mode — one calm results list; count announced politely. */
        <Section ariaLabelledby="results-h">
          <ScrimPool className="p-5 sm:p-7">
            <h2 id="results-h" className="sr-only">
              Search results
            </h2>
            <p aria-live="polite" className="mb-4 font-mono text-mono-label text-ink-muted">
              {matches.length > 0
                ? `// ${matches.length} ${matches.length === 1 ? "entry" : "entries"} match`
                : "// grep returned 0 entries — clear the filter"}
            </p>
            {matches.length > 0 && rows(matches)}
          </ScrimPool>
        </Section>
      ) : posts.length === 0 ? (
        <Section as="div">
          <ScrimPool className="w-fit px-5 py-4">
            <p className="font-mono text-mono-label text-ink-muted">
              {"// signal idle — changelog empty"}
            </p>
          </ScrimPool>
        </Section>
      ) : (
        visibleCats.map((c, i) => {
          const meta = CATEGORY_META[c];
          const list = byCategory(c);
          return (
            <div key={c}>
              <CopperSeam />
              <Section field={meta.field} scrim="none" rhythm="band" ariaLabelledby={`cat-${c}`}>
                <ScrimPool className="p-5 sm:p-7">
                  <SectionHeading
                    id={`cat-${c}`}
                    index={String(i + 1).padStart(2, "0")}
                    title={meta.title}
                    count={`// ${list.length} logged`}
                    accentClass={meta.accentClass}
                  />
                  {list.length === 0 ? (
                    <p className="font-mono text-mono-label text-ink-muted">
                      {`// no entries logged under ${c}`}
                    </p>
                  ) : (
                    rows(list)
                  )}
                </ScrimPool>
              </Section>
            </div>
          );
        })
      )}
    </>
  );
}
