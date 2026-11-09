export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helper?: string;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-xs text-[var(--gs-muted)]">{label}</div>
      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-[var(--gs-radius)] border border-[var(--gs-border)] bg-[var(--gs-surface-2)] px-3 py-2 text-[var(--gs-text)] outline-none transition-colors placeholder:text-[var(--gs-faint)] focus:border-[var(--gs-blue-light)]"
      />
      {helper && <div className="mt-1 text-xs text-[var(--gs-faint)]">{helper}</div>}
    </label>
  );
}
