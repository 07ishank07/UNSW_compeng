---
paths:
  - "src/sanity/**"
  - "sanity.config.ts"
  - "sanity.cli.ts"
  - "scripts/seed.ts"
---

# Working in Sanity

Full schemas, GROQ queries, and the role model are in `docs/sanity-schema.md` — open it before writing or editing a schema; copy the field definitions rather than re-deriving them.

Must hold:
- No write token exists in this repo today (`scripts/seed.ts` is future work). If one is ever added: `SANITY_API_WRITE_TOKEN` may be used only by that seed script, never referenced from anything under `src/app/` or `src/components/`.
- All public reads go through the single tagged fetch wrapper (`src/sanity/lib/fetch.ts`); don't call `client.fetch` directly from a page or component.
- Every query selects only the fields the view actually renders.
- Changing a field name means updating: the schema, every GROQ query selecting it, and the matching type in `src/lib/types.ts`. Treat this as one atomic edit.
- Free tier = Administrator / Editor / Viewer roles, 3 seats. Don't imply per-type permission scoping is enforced — that's a paid-tier feature (`docs/sanity-schema.md` §3.8 explains the curated-desk workaround).
