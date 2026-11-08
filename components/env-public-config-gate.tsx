"use client";

import { getMissingPublicEnv } from "@/lib/env";
import { SETUP_HINT } from "@/lib/validate-public-env";

export function EnvPublicConfigGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const missing = getMissingPublicEnv();
  if (missing.length === 0) {
    return children;
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6">
      <div className="max-w-md rounded-lg border border-border bg-card p-6 shadow-sm">
        <h1 className="text-lg font-semibold text-foreground">
          Environment not configured
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{SETUP_HINT}</p>
        <p className="mt-4 text-sm font-medium text-foreground">
          Missing variables:
        </p>
        <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
          {missing.map((key) => (
            <li key={key}>
              <code className="text-foreground">{key}</code>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted-foreground">
          Restart <code className="text-foreground">npm run dev</code> after
          saving <code className="text-foreground">.env.local</code>.
        </p>
      </div>
    </main>
  );
}
