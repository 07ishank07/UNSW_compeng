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
