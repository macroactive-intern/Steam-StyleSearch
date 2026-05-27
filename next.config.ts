import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All current cover images are served from the local /covers/[cover] route.
    // If external CDN images are added, list their specific hostnames here
    // instead of using a wildcard to prevent Next.js from proxying arbitrary URLs.
    remotePatterns: [],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
};

export default nextConfig;
