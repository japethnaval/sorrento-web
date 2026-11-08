export const REQUIRED_PUBLIC_ENV = [
  "NEXT_PUBLIC_API_URL",
  "NEXT_PUBLIC_COGNITO_REGION",
  "NEXT_PUBLIC_USER_POOL_ID",
  "NEXT_PUBLIC_USER_POOL_CLIENT_ID",
  "NEXT_PUBLIC_TENANT_DISPLAY_NAME",
  "NEXT_PUBLIC_TENANT_PROPERTY",
] as const;

export const SETUP_HINT =
  "Create .env.local (gitignored) with every NEXT_PUBLIC_* variable listed in README.md.";

/** For Node/build only — do not use for client runtime (use getPublicEnv in lib/env.ts). */
export function validatePublicEnv(): void {
  const missing = REQUIRED_PUBLIC_ENV.filter(
    (name) => !process.env[name]?.trim(),
  );
  if (missing.length === 0) return;

  throw new Error(
    `Missing environment variables: ${missing.join(", ")}. ${SETUP_HINT}`,
  );
}
