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
