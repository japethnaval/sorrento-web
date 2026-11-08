const MANILA = "Asia/Manila";

function manilaParts(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: MANILA,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

/** Current Philippines local time as `YYYY-MM-DDTHH:mm` (no offset). */
export function manilaNowLocal(): string {
  const p = manilaParts(new Date());
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

export function addDaysToLocal(local: string, days: number): string {
  const ms = Date.parse(`${local}:00+08:00`);
  if (Number.isNaN(ms)) return local;
  const p = manilaParts(new Date(ms + days * 24 * 60 * 60 * 1000));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}

/** MyHome-style `MM/DD/YYYY HH:MM AM/PM` in Philippines time. */
export function formatMyHomeDateTime(local: string): string {
  const trimmed = local.trim();
  if (!trimmed) return local;
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(trimmed)) {
    return trimmed;
  }

  const ms = Date.parse(
    /^\d{4}-\d{2}-\d{2}T/.test(trimmed)
      ? `${trimmed.includes(":") && trimmed.length === 16 ? `${trimmed}:00` : trimmed}+08:00`
      : trimmed,
  );
  if (Number.isNaN(ms)) return local;
  const p = manilaParts(new Date(ms));
  const hour24 = Number(p.hour);
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  return `${p.month}/${p.day}/${p.year} ${String(hour12).padStart(2, "0")}:${p.minute} ${ampm}`;
}

export function formatCreatedDate(createdDate?: string): string | null {
  if (!createdDate?.trim()) return null;
  return formatMyHomeDateTime(createdDate.trim());
}

export function formatLocalRange(start: string, end: string): string {
  const startDate = Date.parse(`${start}:00+08:00`);
  const endDate = Date.parse(`${end}:00+08:00`);
  if (Number.isNaN(startDate) || Number.isNaN(endDate)) {
    return `${start} – ${end}`;
  }

  const sameDay = start.slice(0, 10) === end.slice(0, 10);
  const dateFmt = new Intl.DateTimeFormat("en-PH", {
    timeZone: MANILA,
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFmt = new Intl.DateTimeFormat("en-PH", {
    timeZone: MANILA,
    hour: "numeric",
    minute: "2-digit",
  });

  const startLabel = `${dateFmt.format(startDate)} · ${timeFmt.format(startDate)}`;
  const endLabel = sameDay
    ? timeFmt.format(endDate)
    : `${dateFmt.format(endDate)} · ${timeFmt.format(endDate)}`;

  return `${startLabel} – ${endLabel}`;
}

export function passwordMeetsPolicy(password: string): string | null {
  if (password.length < 12) return "Use at least 12 characters.";
  if (!/[a-z]/.test(password)) return "Include a lowercase letter.";
  if (!/[A-Z]/.test(password)) return "Include an uppercase letter.";
  if (!/[0-9]/.test(password)) return "Include a number.";
  if (!/[^A-Za-z0-9]/.test(password)) return "Include a symbol.";
  return null;
}
