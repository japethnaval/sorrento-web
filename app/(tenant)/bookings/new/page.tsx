import Link from "next/link";
import { BookingForm } from "@/components/bookings/booking-form";

export default function NewBookingPage() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div>
        <p className="text-sm">
          <Link href="/bookings" className="text-accent hover:underline">
            Back to bookings
          </Link>
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">
          New booking
        </h1>
        <p className="mt-1 text-sm leading-6 text-muted">
          Times are Philippines local time. Bookings can start up to 30 days
          ahead and last at most 7 days.
        </p>
      </div>
      <div className="rounded-sm border border-border bg-card p-6 shadow-sm">
        <BookingForm />
      </div>
    </div>
  );
}
