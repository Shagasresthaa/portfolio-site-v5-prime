/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  output: "standalone",
  serverExternalPackages: [
    "pg",
    "@prisma/adapter-pg",
    "pg-connection-string",
    "pgpass",
  ],
  turbopack: {
    resolveAlias: {
      "@prisma/adapter-pg": { browser: "./pg-browser-stub.mjs" },
      pg: { browser: "./pg-browser-stub.mjs" },
      "pg-connection-string": { browser: "./pg-browser-stub.mjs" },
      pgpass: { browser: "./pg-browser-stub.mjs" },
      "@/server/db": { browser: "./db-browser-stub.mjs" },
      "@/server/api/trpc": { browser: "./db-browser-stub.mjs" },
      "@/server/api/root": { browser: "./db-browser-stub.mjs" },
    },
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default config;
