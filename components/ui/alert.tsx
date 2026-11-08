export function Alert({
  tone = "error",
  children,
}: {
  tone?: "error" | "warning" | "info";
  children: React.ReactNode;
}) {
  const tones = {
    error: "border-danger/30 bg-danger-soft text-danger",
    warning: "border-warning/30 bg-warning-soft text-warning",
    info: "border-border bg-accent-soft text-foreground",
  };

  return (
    <p
      role="alert"
      className={`rounded-lg border px-3 py-2 text-sm leading-6 ${tones[tone]}`}
    >
      {children}
    </p>
  );
}
