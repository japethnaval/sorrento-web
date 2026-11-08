import type { BookingRequest } from "@/lib/api-types";

const CANCELLABLE_STATUSES = new Set(["New", "In-Progress", "Returned"]);

export function canCancelBooking(request: BookingRequest): boolean {
  return (
    Boolean(request.cancelId?.trim()) &&
    CANCELLABLE_STATUSES.has(request.status)
  );
}
