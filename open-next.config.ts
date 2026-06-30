import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// "Static + redeploy-on-publish" path — docs/deployment.md §5.5 option 1
// (the recommended default for this project).
//
// Every Sanity read goes through sanityFetch with cache `tags`, which forces
// `revalidate: false` (fully static at build) — so there is no ISR to service:
// no R2 incremental cache, no Durable Object queue/tag cache. Just the default
// static-assets cache the adapter ships with. Publishing in Studio triggers a
// rebuild + redeploy rather than in-place revalidation.
//
// If a staleness window without a rebuild ever matters, see §5.5 options 2/3 to
// add the R2 bucket (+ DO queue, + DO tag cache) and the matching wrangler.jsonc
// bindings.
export default defineCloudflareConfig({});
