type Props = {
  title?: string;
  children: React.ReactNode;
  className?: string;
};

export default function DashboardPanel({
  title,
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`rounded border border-[#2b3037] bg-[#151a1f] p-3 ${className}`}
    >
      {title && (
        <div className="mb-3 text-sm font-semibold text-[#d8dde6]">{title}</div>
      )}
      {children}
    </div>
  );
}
