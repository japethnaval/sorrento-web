import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/app/providers";
import { EnvPublicConfigGate } from "@/components/env-public-config-gate";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sorrento amenity bookings",
  description: "Book amenities at Sorrento with credentials from your landlord.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <EnvPublicConfigGate>
          <AuthProvider>{children}</AuthProvider>
        </EnvPublicConfigGate>
      </body>
    </html>
  );
}
