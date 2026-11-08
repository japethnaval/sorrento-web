/** Status pill colors aligned with the MyHome detail modal. */
export const BOOKING_STATUS_BADGE: Record<string, string> = {
  New: "bg-[#7c5cbf] text-white",
  "In-Progress": "bg-[#2f80c2] text-white",
  Approved: "bg-[#2f9e6a] text-white",
  Returned: "bg-[#c45c2f] text-white",
};

export function statusBadgeClass(status: string): string {
  return BOOKING_STATUS_BADGE[status] ?? "bg-[#6b7280] text-white";
}
