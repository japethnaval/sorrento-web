/**
 * Runs before production build (see package.json). Loads .env.local when present.
 */
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const envPath = resolve(root, ".env.local");

if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

const required = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_COGNITO_REGION",
  "NEXT_PUBLIC_USER_POOL_ID",
  "NEXT_PUBLIC_USER_POOL_CLIENT_ID",
  "NEXT_PUBLIC_TENANT_DISPLAY_NAME",
  "NEXT_PUBLIC_TENANT_PROPERTY",
];

const missing = required.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  console.error(
    "Build missing environment variables:\n",
    missing.map((k) => `  - ${k}`).join("\n"),
  );
  console.error(
    "\nAdd them to .env.local locally, or to your host's env settings when deploying.",
  );
  console.error("Variable names are documented in README.md.");
  process.exit(1);
}

console.log("Environment validation passed.");
