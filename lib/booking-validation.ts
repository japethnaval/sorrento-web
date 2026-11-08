import { AMENITIES, isAmenityId } from "@/lib/amenities";
import { addDaysToLocal, manilaNowLocal } from "@/lib/format";

const UNIT_ID = /^[A-Za-z0-9-]{1,20}$/;
const LOCAL_DATETIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
const MAX_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export interface BookingFormValues {
  unitId: string;
  amenityId: string;
  start: string;
  end: string;
  guestCount: string;
  notes: string;
}

export type BookingField =
  | "unitId"
  | "amenityId"
  | "start"
  | "end"
  | "guestCount"
  | "notes";

export type BookingFieldErrors = Partial<Record<BookingField, string>>;

function toMs(local: string): number {
  return Date.parse(`${local}:00+08:00`);
}

export function validateBooking(
  values: BookingFormValues,
  allowedUnits: string[],
): BookingFieldErrors {
  const errors: BookingFieldErrors = {};
  const unitId = values.unitId.trim();
  const amenityId = values.amenityId.trim();
  const start = values.start.trim();
  const end = values.end.trim();
  const notes = values.notes.trim();
  const guestCount = Number.parseInt(values.guestCount, 10);

  if (!unitId) {
    errors.unitId = "Choose a unit.";
  } else if (!UNIT_ID.test(unitId)) {
    errors.unitId = "Unit looks invalid.";
  } else if (allowedUnits.length > 0 && !allowedUnits.includes(unitId)) {
    errors.unitId = "That unit is not assigned to your account.";
  }

  if (!amenityId) {
    errors.amenityId = "Choose an amenity.";
  } else if (!isAmenityId(amenityId)) {
    errors.amenityId = "That amenity is not available.";
  }

  if (!start || !LOCAL_DATETIME.test(start)) {
    errors.start = "Choose a start date and time.";
  }
  if (!end || !LOCAL_DATETIME.test(end)) {
    errors.end = "Choose an end date and time.";
  }

  if (!errors.start && !errors.end) {
    const startMs = toMs(start);
    const endMs = toMs(end);
    const now = manilaNowLocal();
    const nowMs = toMs(now);

    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      errors.start = "Use a valid date and time.";
    } else if (endMs <= startMs) {
      errors.end = "End must be after start.";
    } else if (endMs - startMs > MAX_DURATION_MS) {
      errors.end = "Bookings can last at most 7 days.";
    } else if (startMs < nowMs) {
      errors.start = "Start must be in the future.";
    } else if (isAmenityId(amenityId)) {
      const maxAdvance = AMENITIES[amenityId].maxAdvanceDays;
      const latest = addDaysToLocal(now, maxAdvance);
      if (startMs > toMs(latest)) {
        errors.start = `Start must be within ${maxAdvance} days.`;
      }
    }
  }

  if (values.guestCount.trim() === "" || Number.isNaN(guestCount)) {
    errors.guestCount = "Enter a guest count.";
  } else if (!Number.isInteger(guestCount) || guestCount < 0 || guestCount > 99) {
    errors.guestCount = "Guest count must be between 0 and 99.";
  }

  if (notes.length > 200) {
    errors.notes = "Notes can be at most 200 characters.";
  }

  return errors;
}
