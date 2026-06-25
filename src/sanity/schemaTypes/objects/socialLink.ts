import { defineType, defineField } from "sanity";

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
