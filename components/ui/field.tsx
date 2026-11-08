export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-accent">
        {label}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs leading-5 text-muted">{hint}</p>
      ) : null}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs leading-5 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const inputClassName =
  "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-shadow placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60";
