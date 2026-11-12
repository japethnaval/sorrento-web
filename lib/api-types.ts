export type BookingStatus = "In-Progress" | "New" | "Returned" | "Approved";

export const BOOKING_STATUSES: BookingStatus[] = [
  "New",
  "In-Progress",
  "Returned",
  "Approved",
];

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export interface CreateBookingRequest {
  unitId: string;
  amenityId: string;
  start: string;
  end: string;
  guestCount: number;
  notes?: string;
}

export interface CreateBookingSuccess {
  ok: true;
  unitId: string;
  amenityId: string;
  start: string;
  end: string;
  reference?: string;
}

export interface BookingRequest {
  id: string;
  /** MyHome cancel key — use for DELETE, not shown to tenants. */
  cancelId?: string;
  status: string;
  amenity: string;
  start: string;
  end: string;
  /** Tenant notes (registered name, etc.) — not admin approval text. */
  notes?: string;
  /** Admin approval Remarks from MyHome — show to tenant when present. */
  remarks?: string;
  guestCount: number;
  /** Philippines local `YYYY-MM-DDTHH:mm` when the ticket was created. */
  createdDate?: string;
}

export interface CancelBookingSuccess {
  ok: true;
  id: string;
  cancelId: string;
}

export interface ListBookingsResponse {
  units: string[];
  status: string;
  skip: number;
  take: number;
  statuses: string[];
  requests: BookingRequest[];
}

export function isBookingStatus(value: string): value is BookingStatus {
  return (BOOKING_STATUSES as string[]).includes(value);
}
