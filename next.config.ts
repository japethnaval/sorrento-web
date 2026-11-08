import { loadEnvConfig } from "@next/env";
import type { NextConfig } from "next";
import { getSecurityHeaders } from "./lib/security-headers";
import { validatePublicEnv } from "./lib/validate-public-env";

loadEnvConfig(process.cwd());

if (process.env.NODE_ENV === "production") {
  validatePublicEnv();
}

const nextConfig: NextConfig = {
  experimental: {
    agentFeedback: true,
  },
  transpilePackages: ["aws-amplify"],
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: getSecurityHeaders(),
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
