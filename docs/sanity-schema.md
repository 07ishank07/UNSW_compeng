> Reference doc. Not auto-loaded — read this file when the task at hand needs it (Claude: open it explicitly with the Read tool when working in the relevant area).

# §3 — HEADLESS SANITY CONFIGURATION & SCHEMA

The CMS is embedded in the Next app (single repo, single deploy). Schemas are TypeScript and live under `src/sanity/`. Editors work at `/studio`. Everything below is production-ready — no placeholders.

## 3.1 Environment & client

### `src/sanity/env.ts` — typed, fail-loud env access
```ts
// Centralised, validated access to Sanity environment values.
// Importing from here (never process.env directly elsewhere) guarantees a
// clear error at boot if a variable is missing, instead of a confusing
// "undefined projectId" deep inside a fetch.

export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-06-01"; // calendar-versioned: pin query behaviour

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  "Missing environment variable: NEXT_PUBLIC_SANITY_DATASET",
);

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  "Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID",
);

// SERVER ONLY. Never import this into a 'use client' file.
// Used only for authenticated reads (drafts/preview) and never shipped to the browser.
export const readToken = process.env.SANITY_API_READ_TOKEN || "";

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) throw new Error(errorMessage);
  return v;
}
```

### `src/sanity/lib/client.ts` — the read client
```ts
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "../env";

// Single shared client for PUBLISHED content reads.
// useCdn: true  -> fast, cached, free for published docs (what the public site uses).
// For draft/preview reads, create a separate client with useCdn:false + token (see preview.ts),
// kept strictly server-side.
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: "published",
  stega: { studioUrl: "/studio" }, // enables click-to-edit overlays in preview; harmless in prod
});
```

### `src/sanity/lib/image.ts` — image URL builder
```ts
import imageUrlBuilder from "@sanity/image-url";
import type { Image } from "sanity";
import { dataset, projectId } from "../env";

const builder = imageUrlBuilder({ projectId, dataset });

// Always call .width()/.height()/.quality() at the call site so we never ship
// a full-resolution original. Example: urlForImage(logo).width(240).quality(80).url()
export function urlForImage(source: Image) {
  return builder.image(source).auto("format").fit("max");
}
```

### `src/sanity/lib/fetch.ts` — the ONE typed, tagged fetch wrapper
```ts
import "server-only"; // hard guard: this module can never be bundled into client code
import { client } from "./client";
import type { QueryParams } from "next-sanity";

// Every server-side read goes through here so caching + tagging is consistent.
// `tags` let the /api/revalidate webhook surgically invalidate only what changed.
export async function sanityFetch<T>({
  query,
  params = {},
  tags,
  revalidate = 60, // time-based safety net; webhook handles instant updates
}: {
  query: string;
  params?: QueryParams;
  tags?: string[];
  revalidate?: number | false;
}): Promise<T> {
  return client.fetch<T>(query, params, {
    next: {
      revalidate: tags ? false : revalidate, // if tagged, rely on on-demand revalidation
      tags,
    },
  });
}
```
> Note: `next-sanity@13` also ships `defineLive()` for real-time/live preview content. It is an optional upgrade for an "instant preview while editing" experience; the tagged-fetch wrapper above is the stable, version-agnostic baseline. If you adopt `defineLive`, consult current next-sanity docs and keep tokens server-side.

## 3.2 `sanity.config.ts` — Studio configuration (repo root)
```ts
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { apiVersion, dataset, projectId } from "./src/sanity/env";
import { schemaTypes } from "./src/sanity/schemaTypes";
import { structure } from "./src/sanity/structure";

export default defineConfig({
  name: "compengsoc",
  title: "CompEngSoc CMS",
  projectId,
  dataset,
  basePath: "/studio", // Studio is served from this route inside the Next app

  plugins: [
    structureTool({ structure }), // the curated desk (see structure.ts)
    visionTool({ defaultApiVersion: apiVersion }), // GROQ playground, useful for tech lead only
  ],

  schema: { types: schemaTypes },
});
```

## 3.3 `sanity.cli.ts` — CLI / deploy configuration (repo root)
```ts
import { defineCliConfig } from "sanity/cli";
import { dataset, projectId } from "./src/sanity/env";

export default defineCliConfig({
  api: { projectId, dataset },
  // Optional: enables auto-updates of the deployed Studio + fine-grained version selection.
  // appId is shown in sanity.io/manage after first deploy. Requires @sanity/cli >= 4.9.
  // studioHost: "compengsoc",  // only if deploying a standalone *.sanity.studio mirror
  autoUpdates: true,
});
```

## 3.4 `src/sanity/structure.ts` — the curated editing desk
```ts
import type { StructureResolver } from "sanity/structure";

// The desk is the editor's whole world. Group documents into a clean, named
// hierarchy so a rotating exec sees exactly the few inputs they need and never
// gets lost in a flat type list. (This is also our practical scoping layer; see §3.7.)
export const structure: StructureResolver = (S) =>
  S.list()
    .title("CompEngSoc")
    .items([
      S.listItem()
        .title("Events")
        .child(S.documentTypeList("event").title("Events").defaultOrdering([{ field: "startDateTime", direction: "desc" }])),
      S.listItem()
        .title("Academic resources")
        .child(S.documentTypeList("academicResource").title("Academic resources")),
      S.listItem()
        .title("Sponsors")
        .child(S.documentTypeList("sponsor").title("Sponsors").defaultOrdering([{ field: "tier", direction: "asc" }])),
      S.listItem()
        .title("Blog / changelog")
        .child(S.documentTypeList("post").title("Posts").defaultOrdering([{ field: "publishedAt", direction: "desc" }])),
      S.listItem()
        .title("Exec team")
        .child(S.documentTypeList("execMember").title("Exec team").defaultOrdering([{ field: "order", direction: "asc" }])),
      S.divider(),
      // Singleton: exactly one settings document, edited in place (not a creatable list).
      S.listItem()
        .title("Site settings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
```

## 3.5 Object (reusable) schemas

### `src/sanity/schemaTypes/objects/blockContent.ts` — Portable Text config
```ts
import { defineType, defineArrayMember } from "sanity";

// Shared rich-text definition used by event/post bodies. Keep the allowed styles
// minimal and on-brand: no random font sizes; structure carries meaning.
export const blockContent = defineType({
  name: "blockContent",
  title: "Body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Subheading", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Emphasis", value: "em" },
          { title: "Code", value: "code" }, // renders in the mono "machine voice"
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              { name: "href", type: "url", title: "URL", validation: (r) => r.required() },
              { name: "blank", type: "boolean", title: "Open in new tab", initialValue: true },
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text", validation: (r) => r.required() }],
    }),
  ],
});
```

### `src/sanity/schemaTypes/objects/socialLink.ts`
```ts
import { defineType, defineField } from "sanity";

// Reused by execMember and siteSettings. A platform enum + url keeps icons consistent.
export const socialLink = defineType({
  name: "socialLink",
  title: "Social link",
  type: "object",
  fields: [
    defineField({
      name: "platform",
      title: "Platform",
      type: "string",
      options: {
        list: ["instagram", "linkedin", "facebook", "discord", "github", "youtube", "email", "website"],
        layout: "dropdown",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "url",
      title: "URL (or mailto:)",
      type: "url",
      validation: (r) => r.required().uri({ scheme: ["http", "https", "mailto"] }),
    }),
  ],
  preview: { select: { title: "platform", subtitle: "url" } },
});
```

### `src/sanity/schemaTypes/objects/seo.ts`
```ts
import { defineType, defineField } from "sanity";

// Optional per-document SEO overrides. Falls back to title/excerpt when empty.
export const seo = defineType({
  name: "seo",
  title: "SEO",
  type: "object",
  options: { collapsible: true, collapsed: true },
  fields: [
    defineField({ name: "metaTitle", type: "string", title: "Meta title", validation: (r) => r.max(60) }),
    defineField({ name: "metaDescription", type: "text", rows: 2, title: "Meta description", validation: (r) => r.max(160) }),
    defineField({ name: "ogImage", type: "image", title: "Social share image" }),
  ],
});
```

## 3.6 Document schemas

### `src/sanity/schemaTypes/documents/event.ts`
```ts
import { defineType, defineField } from "sanity";

export const event = defineType({
  name: "event",
  title: "Event",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "eventType",
      title: "Event type",
      type: "string",
      description: "Drives the 'packet type' glyph + label on the Signal Timeline.",
      options: {
        list: [
          { title: "Cruise", value: "cruise" },
          { title: "Camp", value: "camp" },
          { title: "Workshop", value: "workshop" },
          { title: "Networking", value: "networking" },
          { title: "Social", value: "social" },
          { title: "Hackathon", value: "hackathon" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "startDateTime",
      title: "Starts",
      type: "datetime",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "endDateTime",
      title: "Ends",
      type: "datetime",
      // No required(): single-point events may omit an end time.
    }),
    defineField({ name: "location", title: "Location", type: "string" }),
    defineField({
      name: "heroImage",
      title: "Hero image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({
      name: "shortDescription",
      title: "Short description",
      type: "text",
      rows: 3,
      description: "One or two sentences shown on the datasheet panel.",
      validation: (r) => r.max(280),
    }),
    defineField({ name: "body", title: "Full details", type: "blockContent" }),
    defineField({
      name: "ticketUrl",
      title: "Ticket / RSVP URL",
      type: "url",
      description: "External ticketing link (e.g. Arc/Humanitix). Leave empty for free drop-ins.",
    }),
    defineField({ name: "capacity", title: "Capacity", type: "number" }),
    defineField({
      name: "featured",
      title: "Feature on home page",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    { title: "Soonest first", name: "startAsc", by: [{ field: "startDateTime", direction: "asc" }] },
    { title: "Newest first", name: "startDesc", by: [{ field: "startDateTime", direction: "desc" }] },
  ],
  preview: {
    select: { title: "title", subtitle: "startDateTime", media: "heroImage" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? new Date(subtitle).toLocaleString("en-AU") : "No date",
      media,
    }),
  },
});
```

### `src/sanity/schemaTypes/documents/sponsor.ts`
```ts
import { defineType, defineField } from "sanity";

export const sponsor = defineType({
  name: "sponsor",
  title: "Sponsor",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "tier",
      title: "Tier",
      type: "string",
      description: "Determines which 'voltage rail' the sponsor sits on (Platinum = top).",
      options: {
        list: [
          { title: "Platinum", value: "platinum" },
          { title: "Gold", value: "gold" },
          { title: "Silver", value: "silver" },
          { title: "Partner", value: "partner" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      options: { hotspot: true },
      description: "Prefer a transparent PNG/SVG that reads on a dark substrate.",
      fields: [{ name: "alt", type: "string", title: "Alt text", validation: (r) => r.required() }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: "website",
      title: "Website",
      type: "url",
      validation: (r) => r.required().uri({ scheme: ["http", "https"] }),
    }),
    defineField({ name: "blurb", title: "Short blurb", type: "text", rows: 3, validation: (r) => r.max(280) }),
    defineField({
      name: "order",
      title: "Order within tier",
      type: "number",
      description: "Lower number = earlier. Use to rank co-tier sponsors.",
      initialValue: 0,
    }),
  ],
  orderings: [{ title: "Tier", name: "tier", by: [{ field: "tier", direction: "asc" }, { field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "tier", media: "logo" } },
});
```

### `src/sanity/schemaTypes/documents/execMember.ts`
```ts
import { defineType, defineField } from "sanity";

export const execMember = defineType({
  name: "execMember",
  title: "Exec member",
  type: "document",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "role",
      title: "Role",
      type: "string",
      description: "e.g. President, Treasurer, Industry Director. Rendered as the 'part number'.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "portfolio",
      title: "Portfolio",
      type: "string",
      options: { list: ["Executive", "Industry", "Academic", "Socials", "Technical", "Marketing"] },
    }),
    defineField({
      name: "photo",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({ name: "bio", title: "Bio", type: "text", rows: 3 }),
    defineField({ name: "socials", title: "Socials", type: "array", of: [{ type: "socialLink" }] }),
    defineField({
      name: "term",
      title: "Term (year)",
      type: "number",
      description: "e.g. 2026. Lets you archive past committees by filtering on year.",
      initialValue: new Date().getFullYear(),
    }),
    defineField({ name: "order", title: "Display order", type: "number", initialValue: 0 }),
  ],
  orderings: [{ title: "Display order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "role", media: "photo" } },
});
```

### `src/sanity/schemaTypes/documents/post.ts`
```ts
import { defineType, defineField } from "sanity";

export const post = defineType({
  name: "post",
  title: "Blog post",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "author",
      title: "Author",
      type: "reference",
      to: [{ type: "execMember" }],
      description: "Links the post to an exec so bylines stay consistent.",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: { list: ["announcement", "recap", "technical", "opportunity"] },
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Alt text" }],
    }),
    defineField({ name: "excerpt", title: "Excerpt", type: "text", rows: 3, validation: (r) => r.max(280) }),
    defineField({ name: "body", title: "Body", type: "blockContent" }),
    defineField({
      name: "publishedAt",
      title: "Published at",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    defineField({ name: "tags", title: "Tags", type: "array", of: [{ type: "string" }], options: { layout: "tags" } }),
    defineField({ name: "seo", title: "SEO", type: "seo" }),
  ],
  orderings: [{ title: "Newest", name: "pubDesc", by: [{ field: "publishedAt", direction: "desc" }] }],
  preview: {
    select: { title: "title", subtitle: "publishedAt", media: "coverImage" },
    prepare: ({ title, subtitle, media }) => ({
      title,
      subtitle: subtitle ? new Date(subtitle).toLocaleDateString("en-AU") : "Draft",
      media,
    }),
  },
});
```

### `src/sanity/schemaTypes/documents/academicResource.ts`
```ts
import { defineType, defineField } from "sanity";

export const academicResource = defineType({
  name: "academicResource",
  title: "Academic resource",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Title", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "courseCode",
      title: "Course code",
      type: "string",
      description: "e.g. COMP1511. Rendered as the mono 'address' on the Memory Map.",
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      description: "Defines the colour-coded segment on the Memory Map.",
      options: {
        list: [
          { title: "Wiki", value: "wiki" },
          { title: "Course notes", value: "notes" },
          { title: "Cheat sheet", value: "cheatsheet" },
          { title: "PCB design", value: "pcb" },
          { title: "LaTeX guide", value: "latex" },
          { title: "Video", value: "video" },
        ],
        layout: "radio",
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      description: "Drive folder / YouTube / wiki link. Leave empty if using an inline body instead.",
    }),
    defineField({
      name: "file",
      title: "File",
      type: "file",
      description: "Optional direct upload (PDF cheat sheet, etc.). Prefer externalUrl for large/Drive content.",
    }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2, validation: (r) => r.max(240) }),
    defineField({ name: "body", title: "Inline content (optional)", type: "blockContent" }),
    defineField({
      name: "contributors",
      title: "Contributors",
      type: "array",
      of: [{ type: "reference", to: [{ type: "execMember" }] }],
    }),
    defineField({ name: "order", title: "Order", type: "number", initialValue: 0 }),
  ],
  preview: { select: { title: "title", subtitle: "courseCode" } },
});
```

### `src/sanity/schemaTypes/documents/siteSettings.ts` — singleton
```ts
import { defineType, defineField } from "sanity";

// One document only (id pinned to "siteSettings" in structure.ts). Holds global,
// rarely-changed content: socials, contact emails, the persistent tagline.
export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    defineField({ name: "tagline", title: "Tagline", type: "string", initialValue: "Where silicon meets software." }),
    defineField({ name: "contactEmail", title: "General contact email", type: "string" }),
    defineField({ name: "socials", title: "Socials", type: "array", of: [{ type: "socialLink" }] }),
    defineField({
      name: "newsletterUrl",
      title: "Newsletter sign-up URL",
      type: "url",
    }),
    defineField({ name: "defaultSeo", title: "Default SEO", type: "seo" }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});
```

### `src/sanity/schemaTypes/index.ts` — the registry
```ts
import type { SchemaTypeDefinition } from "sanity";

// Objects (reusable)
import { blockContent } from "./objects/blockContent";
import { socialLink } from "./objects/socialLink";
import { seo } from "./objects/seo";

// Documents
import { event } from "./documents/event";
import { sponsor } from "./documents/sponsor";
import { execMember } from "./documents/execMember";
import { post } from "./documents/post";
import { academicResource } from "./documents/academicResource";
import { siteSettings } from "./documents/siteSettings";

// Order: objects first, then documents. One array, imported by sanity.config.ts.
export const schemaTypes: SchemaTypeDefinition[] = [
  blockContent,
  socialLink,
  seo,
  event,
  sponsor,
  execMember,
  post,
  academicResource,
  siteSettings,
];
```

## 3.7 GROQ queries — `src/sanity/lib/queries.ts`
```ts
import { groq } from "next-sanity";

// All queries centralised. Each requests only the fields its view renders.
// Status (upcoming/past) for events is computed in the UI from startDateTime,
// so the store never holds a flag that can go stale.

export const upcomingEventsQuery = groq`
  *[_type == "event" && startDateTime >= now()] | order(startDateTime asc){
    _id, title, "slug": slug.current, eventType, startDateTime, endDateTime,
    location, shortDescription, ticketUrl, "image": heroImage
  }`;

export const pastEventsQuery = groq`
  *[_type == "event" && startDateTime < now()] | order(startDateTime desc){
    _id, title, "slug": slug.current, eventType, startDateTime, location, "image": heroImage
  }`;

export const featuredEventsQuery = groq`
  *[_type == "event" && featured == true && startDateTime >= now()]
    | order(startDateTime asc)[0...3]{
      _id, title, "slug": slug.current, eventType, startDateTime, location
    }`;

export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0]{
    _id, title, eventType, startDateTime, endDateTime, location,
    shortDescription, body, ticketUrl, capacity, "image": heroImage
  }`;

export const sponsorsQuery = groq`
  *[_type == "sponsor"] | order(
    select(tier == "platinum" => 0, tier == "gold" => 1, tier == "silver" => 2, 3) asc,
    order asc
  ){ _id, name, tier, "logo": logo, "alt": logo.alt, website, blurb }`;

export const execQuery = groq`
  *[_type == "execMember"] | order(order asc){
    _id, name, role, portfolio, bio, "photo": photo, socials, term
  }`;

export const postsQuery = groq`
  *[_type == "post"] | order(publishedAt desc){
    _id, title, "slug": slug.current, category, excerpt, publishedAt,
    "author": author->name, "cover": coverImage
  }`;

export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0]{
    title, category, publishedAt, body, "cover": coverImage,
    "author": author->{name, role}, seo
  }`;

export const academicResourcesQuery = groq`
  *[_type == "academicResource"] | order(category asc, order asc){
    _id, title, courseCode, category, externalUrl, "fileUrl": file.asset->url,
    description, "hasBody": defined(body)
  }`;

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]{ tagline, contactEmail, socials, newsletterUrl, defaultSeo }`;
```

## 3.8 Permissions & roles — who can edit what

**The honest baseline (free / lower tiers).** Sanity's free tier provides the built-in roles **Administrator**, **Editor**, and **Viewer**, plus **3 seats**.

- **Technical lead → Administrator.** Full access: project settings, datasets, API tokens, members/billing, schema deploys. Exactly one or two trusted people hold this.
- **Rotating execs (Socials / Academic / Industry) → Editor.** Editors can create, edit, publish, and delete **content**, but **cannot** change project settings, manage API tokens, invite/remove members, or alter billing. This is the right default for a society where committees turn over yearly: handover is "invite the new exec as Editor, remove the graduate."
- **Viewer** for anyone who only needs read access (e.g. a faculty contact).

**Scoping an Editor to *only* their content type** (e.g. Socials exec can touch only `event`, Academic exec only `academicResource`) requires **custom roles with document-level filters**, which is a **paid (Growth/Enterprise) feature**. Do not pretend the free tier enforces this. Two pragmatic options:

1. **Process + curated desk (free).** Give all rotating execs the `Editor` role and use the **Structure** (`structure.ts`) to present a clean, role-relevant desk so each person's inputs are front-and-centre. This is organisational, not a hard permission boundary — an Editor *can* still navigate to other types — but for a small trusted committee it is usually sufficient, and it keeps the editing UI uncluttered.
2. **Custom roles (paid).** If true enforcement is required, upgrade and define custom roles in `sanity.io/manage` with a read/write filter per type, e.g. a "Socials Editor" role limited to documents where `_type == "event"`. Reference this here when/if the society upgrades.

**Token hygiene (independent of roles).** Create two API tokens in `sanity.io/manage`: a **Viewer/Read token** (used server-side for drafts/preview if needed) and, only if a build-time script genuinely needs it, a narrowly-scoped **write token** for the seed script (§5). The write token is **server-only**, never `NEXT_PUBLIC_*`, and is removed from any environment that doesn't need it. CORS origins (`http://localhost:3000` and the production domain) are added under API settings so the embedded Studio and previews can authenticate.

---

