export function LoadingScreen({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
