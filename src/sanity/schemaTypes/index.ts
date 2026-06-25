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

// Order: objects first, then documents.
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
