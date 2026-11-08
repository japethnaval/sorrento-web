"use client";

import { useAuth } from "@/app/providers";
import { RedirectTo } from "@/components/redirect-to";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function HomeRedirect() {
  const { status } = useAuth();

  if (status === "authenticated") {
    return <RedirectTo href="/bookings" />;
  }

  if (status === "unauthenticated") {
    return <RedirectTo href="/login" />;
  }

  return <LoadingScreen />;
}
