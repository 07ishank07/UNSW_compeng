import type { StructureResolver } from "sanity/structure";

// The desk groups documents into a clean, named hierarchy so a rotating exec
// sees exactly the inputs they need and never gets lost in a flat type list.
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
        .child(S.documentTypeList("sponsor").title("Sponsors").defaultOrdering([{ field: "order", direction: "asc" }])),
      S.listItem()
        .title("Blog / changelog")
        .child(S.documentTypeList("post").title("Posts").defaultOrdering([{ field: "publishedAt", direction: "desc" }])),
      S.listItem()
        .title("Exec team")
        .child(S.documentTypeList("execMember").title("Exec team").defaultOrdering([{ field: "order", direction: "asc" }])),
      S.divider(),
      S.listItem()
        .title("Site settings")
        .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
