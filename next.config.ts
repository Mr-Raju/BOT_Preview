import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // This repo is not a single-package root; keep Next rooted here.
    root: __dirname,
  },
};

export default nextConfig;
