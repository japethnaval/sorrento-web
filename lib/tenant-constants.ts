import { getPublicEnv } from "@/lib/env";

/** Property label on the guard-facing modal (“Sorrento”). */
export function getTenantProperty(): string {
  return getPublicEnv().tenantProperty;
}

/** “Requested By” on the guard-facing modal (must match MyHome notes). */
export function getTenantRequestedBy(): string {
  return getPublicEnv().tenantDisplayName.toUpperCase();
}
