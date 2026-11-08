import { Suspense } from "react";
import { BookingList } from "@/components/bookings/booking-list";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function BookingsPage() {
  return (
    <Suspense fallback={<LoadingScreen label="Loading bookings…" />}>
      <BookingList />
    </Suspense>
  );
}
