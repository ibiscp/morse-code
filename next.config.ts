import type { NextConfig } from "next";

// GitHub Pages serves this project repo under a sub-path
// (https://ibiscp.github.io/morse-code), so the deploy workflow sets
// BASE_PATH="/morse-code" at build time. Locally it defaults to "" so
// `next dev` and local builds serve from the root.
const basePath = process.env.BASE_PATH ?? "";

const nextConfig: NextConfig = {
  // Emit a fully static site into `out/` that any static host can serve.
  output: "export",
  basePath,
  // Expose the prefix to the client so raw asset URLs (CSS background-image,
  // etc.) can be prefixed too; next/link and next/image do this automatically.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // GitHub Pages can't run the Next.js image optimizer, so serve images as-is.
  images: { unoptimized: true },
  // Emit `/route/index.html` so directory-style URLs resolve on static hosts.
  trailingSlash: true,
};

export default nextConfig;
