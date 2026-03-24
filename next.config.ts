import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // SQLite packages only needed for local dev fallback.
  // On Vercel, Upstash is used via HTTP — no native binaries needed.
  // These are marked external so Next.js doesn't try to bundle them.
  serverExternalPackages:
    process.env.UPSTASH_REDIS_REST_URL
      ? [] // Upstash mode: no native packages needed
      : ["@prisma/client", "better-sqlite3", "@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
