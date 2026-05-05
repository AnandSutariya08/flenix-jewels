import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "*.replit.dev",
    "*.sisko.replit.dev",
    process.env.REPLIT_DEV_DOMAIN || "",
  ].filter(Boolean),
};

export default nextConfig;
