export default function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded-[var(--gs-radius)] border border-dashed border-[var(--gs-border)] bg-[var(--gs-surface-2)] p-8 text-center">
      <div className="text-sm font-semibold text-[var(--gs-text)]">{title}</div>
      <div className="mt-2 text-sm text-[var(--gs-muted)]">{message}</div>
    </div>
  );
}
