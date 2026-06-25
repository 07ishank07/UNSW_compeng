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
