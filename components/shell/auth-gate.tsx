"use client";

import { useAuth } from "@/app/providers";
import { RedirectTo } from "@/components/redirect-to";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === "unauthenticated") {
    return <RedirectTo href="/login" />;
  }

  if (status !== "authenticated") {
    return <LoadingScreen label="Checking your session…" />;
  }

  return <>{children}</>;
}
