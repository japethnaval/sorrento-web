import { SETUP_HINT } from "@/lib/validate-public-env";

/** Next inlines only literal `process.env.NEXT_PUBLIC_*` — not dynamic `process.env[name]`. */
function requirePublic(value: string | undefined, name: string): string {
  const trimmed = value?.trim();
  if (trimmed) return trimmed;
  throw new Error(`Missing ${name}. ${SETUP_HINT}`);
}

export function getPublicEnv() {
  const apiUrl = requirePublic(
    process.env.NEXT_PUBLIC_API_URL,
    "NEXT_PUBLIC_API_URL",
  ).replace(/\/$/, "");
  return {
    apiUrl,
    cognitoRegion: requirePublic(
      process.env.NEXT_PUBLIC_COGNITO_REGION,
      "NEXT_PUBLIC_COGNITO_REGION",
    ),
    userPoolId: requirePublic(
      process.env.NEXT_PUBLIC_USER_POOL_ID,
      "NEXT_PUBLIC_USER_POOL_ID",
    ),
    userPoolClientId: requirePublic(
      process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
      "NEXT_PUBLIC_USER_POOL_CLIENT_ID",
    ),
    tenantDisplayName: requirePublic(
      process.env.NEXT_PUBLIC_TENANT_DISPLAY_NAME,
      "NEXT_PUBLIC_TENANT_DISPLAY_NAME",
    ),
    tenantProperty: requirePublic(
      process.env.NEXT_PUBLIC_TENANT_PROPERTY,
      "NEXT_PUBLIC_TENANT_PROPERTY",
    ),
  };
}

export function getMissingPublicEnv(): string[] {
  const entries: [string, string | undefined][] = [
    ["NEXT_PUBLIC_API_URL", process.env.NEXT_PUBLIC_API_URL],
    ["NEXT_PUBLIC_COGNITO_REGION", process.env.NEXT_PUBLIC_COGNITO_REGION],
    ["NEXT_PUBLIC_USER_POOL_ID", process.env.NEXT_PUBLIC_USER_POOL_ID],
    [
      "NEXT_PUBLIC_USER_POOL_CLIENT_ID",
      process.env.NEXT_PUBLIC_USER_POOL_CLIENT_ID,
    ],
    [
      "NEXT_PUBLIC_TENANT_DISPLAY_NAME",
      process.env.NEXT_PUBLIC_TENANT_DISPLAY_NAME,
    ],
    ["NEXT_PUBLIC_TENANT_PROPERTY", process.env.NEXT_PUBLIC_TENANT_PROPERTY],
  ];
  return entries.filter(([, v]) => !v?.trim()).map(([k]) => k);
}
