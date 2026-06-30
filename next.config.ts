import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const nextConfig: NextConfig = {
  images: {
    // Sanity's CDN (@sanity/image-url) already resizes/reformats images.
    // Re-optimizing them through Next's image API on the Workers runtime needs a
    // Cloudflare Images binding we don't otherwise want, so disable optimization
    // and let Sanity's CDN do the work (docs/deployment.md §5.2).
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    unoptimized: true,
  },
};

// Gives `next dev` access to local Cloudflare bindings; a no-op in production builds.
initOpenNextCloudflareForDev();

export default nextConfig;
