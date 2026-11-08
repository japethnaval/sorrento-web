import { AuthGate } from "@/components/shell/auth-gate";
import { AppHeader } from "@/components/shell/app-header";

export default function TenantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGate>
      <div className="flex min-h-full flex-col">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-8">
          {children}
        </main>
      </div>
    </AuthGate>
  );
}
