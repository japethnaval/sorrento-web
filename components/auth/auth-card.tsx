export function AuthCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md overflow-hidden rounded-sm border border-border bg-card shadow-md">
        <div className="bg-accent px-6 py-3.5">
          <p className="text-xs font-semibold tracking-wide text-white/90 uppercase">
            Sorrento
          </p>
          <h1 className="mt-1 text-lg font-semibold text-white">{title}</h1>
        </div>
        <div className="px-6 py-6">
          <p className="text-sm leading-6 text-muted">{description}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
