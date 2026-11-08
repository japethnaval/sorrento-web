"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/button";

const links = [
  { href: "/bookings", label: "My bookings" },
  { href: "/bookings/new", label: "New booking" },
];

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOutUser } = useAuth();

  async function onSignOut() {
    await signOutUser();
    router.replace("/login");
  }

  return (
    <header className="border-b border-[#134670] bg-accent text-white shadow-sm">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <div>
          <Link
            href="/bookings"
            className="text-lg font-semibold tracking-tight text-white"
          >
            Sorrento
          </Link>
          <p className="text-xs text-white/80">Amenity bookings</p>
        </div>
        <nav className="flex flex-wrap items-center gap-1">
          {links.map((link) => {
            const active =
              link.href === "/bookings"
                ? pathname === "/bookings"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded px-3 py-2 text-sm font-medium ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/85 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Button
            variant="secondary"
            type="button"
            className="border-white/40 bg-white text-accent hover:bg-white/95"
            onClick={() => void onSignOut()}
          >
            Sign out
          </Button>
        </nav>
      </div>
    </header>
  );
}
