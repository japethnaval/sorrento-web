/** Shown on the MyHome-style detail modal (fixed for this tenant UI). */
export const TENANT_PROPERTY = "SOD-L03-U005-1";

/**
 * Display name for “Requested By” on the guard-facing modal.
 * Override with `NEXT_PUBLIC_TENANT_DISPLAY_NAME` when set.
 */
export const TENANT_REQUESTED_BY =
  process.env.NEXT_PUBLIC_TENANT_DISPLAY_NAME?.trim() || "JAPETH NAVAL";
