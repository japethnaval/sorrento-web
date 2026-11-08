const KEY = "sorrento.units";

export function saveUnits(units: string[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(units));
}

export function loadUnits(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}
