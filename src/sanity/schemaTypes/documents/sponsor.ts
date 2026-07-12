import { defineType, defineField } from "sanity";

export const sponsor = defineType({
  name: "sponsor",
  title: "Sponsor",
  type: "document",
  fields: [
    // NOTE: sponsor tiers were removed deliberately — every sponsor sits on one
    // equal rail (tiered ranks read as unappealing to prospective sponsors).
    // Manual `order` is the only ranking.
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
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
      title: "Order",
      type: "number",
      description: "Lower number = earlier on the rail.",
      initialValue: 0,
    }),
  ],
  orderings: [{ title: "Order", name: "order", by: [{ field: "order", direction: "asc" }] }],
  preview: { select: { title: "name", subtitle: "website", media: "logo" } },
});
