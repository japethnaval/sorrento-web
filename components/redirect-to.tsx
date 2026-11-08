"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LoadingScreen } from "@/components/ui/loading-screen";

export function RedirectTo({ href, label }: { href: string; label?: string }) {
  const router = useRouter();

  useEffect(() => {
    router.replace(href);
  }, [href, router]);

  return <LoadingScreen label={label ?? "Redirecting…"} />;
}
