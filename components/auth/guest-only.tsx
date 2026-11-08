"use client";

import { useAuth } from "@/app/providers";
import { RedirectTo } from "@/components/redirect-to";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function GuestOnly({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === "authenticated") {
    return <RedirectTo href="/bookings" />;
  }

  if (status === "loading") {
    return <LoadingScreen />;
  }

  return <>{children}</>;
}
