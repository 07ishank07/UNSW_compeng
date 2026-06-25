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
