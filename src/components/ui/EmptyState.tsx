export default function EmptyState({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="rounded border border-dashed border-[#2f3240] bg-[#111217] p-8 text-center">
      <div className="text-sm font-semibold text-[#d8d9da]">{title}</div>
      <div className="mt-2 text-sm text-[#9fa7b3]">{message}</div>
    </div>
  );
}
