import { defineType, defineField } from "sanity";

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
