import { defineType, defineField } from "sanity";

// One document only (id pinned to "siteSettings" in structure.ts).
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
