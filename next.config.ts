import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores stray lockfiles higher up
  // (e.g. C:\Users\sagar\package-lock.json).
  turbopack: {
    root: path.join(__dirname),
  },
};

export default nextConfig;
